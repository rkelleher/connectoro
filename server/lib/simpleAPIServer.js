import _ from "lodash";
import axios from 'axios';

const get = _.get;

import Hapi from "@hapi/hapi";
import Joi from "@hapi/joi";
import Boom from "@hapi/boom";
import Hoek from "@hapi/hoek";
const { assert } = Hoek;
import bcrypt from "bcrypt";
import hapiJWT from "hapi-auth-jwt2";

import { DBValidationError } from "./services/database.js";
import { createUserToken, validateToken } from "./auth.js";
import {
  buildUserDetails,
  getUserDetailsById,
  getUserByEmail,
  createAdminUser,
  removeUser,
  getUser,
  getUsers,
  getUserAccount
} from "./controllers/user.controller.js";
import {
  createNewLinkedAccount,
  getAccount,
  addIntegration,
  deleteIntegration,
  updateIntegration,
  getIntegrationCredential,
  getIntegrationByType,
  getAccountRetailerCodes,
  deleteAccountRetailerCode,
  updateAccountRetailerCode,
  getAccountCountries
} from "./controllers/account.controller.js";
import {
  buildPopulatedOrdersForAccount,
  createOrders,
  getOrder,
  awaitCheckAndUpdateOrder,
  buildPopulatedOrder,
  syncOrderEasyncData,
  getOrderByLinworkId
} from "./controllers/order.controller.js";
import {
  LINNW_INTEGRATION_TYPE,
  makeLinnworksAPISession,
  getLinnworksOpenOrdersPaged,
  convertLinnworksOrder,
  getLinnworksLocations
} from "./integrations/linnworks.js";
import {
  EASYNC_INTEGRATION_TYPE,
  EASYNC_TOKEN_CREDENTIAL_KEY,
  mapEasyncStatus
} from "./integrations/easync/easync.js";
import { buildEasyncOrderPayload, buildEasyncOrderReq } from "./integrations/easync/buildEasyncOrderPayload.js";
import {
  createProduct,
  getProductsForAccount
} from "./controllers/product.controller.js";
import { INTEGRATION_TYPES } from "./models/account.model.js";
import { recursiveMongooseUpdate } from "./utils.js";
import { Order } from "./models/order.model.js";
import { Product } from "./models/product.model.js";
import { updateOrderById } from "./controllers/order.controller.js";

const ERR_NO_USER_WITH_EMAIL = "ERR_NO_USER_WITH_EMAIL";
const ERR_EMAIL_TAKEN = "ERR_EMAIL_TAKEN";
const ERR_WRONG_PASSWORD = "ERR_WRONG_PASSWORD";

export async function buildSimpleAPIServer(cg, db) {
  assert(cg && db, "Missing params");

  const server = Hapi.server({
    port: cg("PORT"),
    host: cg("HTTP_SERVER_HOST"),
    routes: {
      cors: cg("NODE_ENV") === "development"
    }
  });

  server.app.db = db;

  await server.register(hapiJWT);

  const JWT_SECRET = cg("JWT_SECRET");

  assert(JWT_SECRET, "Missing JWT secret");

  server.auth.strategy("jwt", "jwt", {
    key: JWT_SECRET,
    validate: validateToken,
    verifyOptions: { algorithms: [cg("JWT_ALGORITH")] },
    tokenType: "Bearer"
  });

  server.auth.default("jwt");

  // Get current version
  server.route({
    method: "GET",
    path: "/api/current-version",
    handler: async (request, h) => {
      return { version: '1.3.0 [PROCESSED LOGIC]' };
    }
  });

  // Test send order
  server.route({
    method: "POST",
    path: "/api/test-send-order",
    handler: async (request, h) => {
      const { orderId } = request.payload;
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }
      const order = await getOrder(orderId);
      if (!order) {
        return Boom.badRequest("No order found");
      }
      const account = await getAccount(user.account);
      const integration = await getIntegrationByType(
        account,
        EASYNC_INTEGRATION_TYPE
      );
      const token = getIntegrationCredential(
        integration,
        EASYNC_TOKEN_CREDENTIAL_KEY
      );
      if (!token) {
        throw Boom.badRequest("No Easync api token!");
      }
      const easyncReq = buildEasyncOrderPayload({ order });
      return { easyncReq };
    },
    options: {
      validate: {
        payload: Joi.object({
          orderId: Joi.string().required()
        })
      }
    }
  });

  // test send order to easync
  server.route({
    method: "POST",
    path: "/api/easync/order-test",
    handler: async (request, h) => {
      const { orderId } = request.payload;
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }
      const order = await getOrder(orderId);
      if (!order) {
        return Boom.badRequest("No order found");
      }
      const account = await getAccount(user.account);
      const integration = await getIntegrationByType(
          account,
          EASYNC_INTEGRATION_TYPE
      );
      const token = getIntegrationCredential(
          integration,
          EASYNC_TOKEN_CREDENTIAL_KEY
      );
      if (!token) {
        throw Boom.badRequest("No Easync api token!");
      }

      const easyncPayload = await buildEasyncOrderPayload({ order });

      const easyncReq = await buildEasyncOrderReq(easyncPayload, token);

      const { data } = await axios({
        method: "POST",
        url: easyncReq.uri,
        headers: easyncReq.headers,
        data: easyncReq.payload,
      })
      .catch(err => {
        console.error(err);
      });

      const { request_id } = data;

      // TODO return easyncOrderStatus to frontend and set it in reducer
      await updateOrderById(orderId, {
        ...mapEasyncStatus(data),
        requestId: request_id,
        idempotencyKey: easyncPayload.idempotency_key
      });

      // TODO sockets
      awaitCheckAndUpdateOrder({
        orderId,
        token,
        requestId: request_id
      });

      return { data };
    }
  });

  // Get order
  server.route({
    method: "GET",
    path: "/api/orders/{orderId}",
    handler: async (request, h) => {
      const { orderId } = request.params;
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }
      let order;
      try {
        order = await Order.findById(orderId);
      } catch (error) {
        console.error(error);
      }
      if (!order) {
        return Boom.badRequest();
      }
      if (!order.accountId.equals(user.account)) {
        return Boom.unauthorized();
      }
      await syncOrderEasyncData(order);
      return await buildPopulatedOrder(orderId);
    },
    options: {
      validate: {
        params: Joi.object({
          orderId: Joi.string().required()
        })
      }
    }
  });

  // Delete order
  server.route({
    method: "DELETE",
    path: "/api/orders/{id}",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }
      let order;
      try {
        order = await Order.findById(request.params.id);
      } catch (error) {
        console.error(error);
      }
      if (!order) {
        return Boom.badRequest();
      }
      if (!order.accountId.equals(user.account)) {
        return Boom.unauthorized();
      }
      await order.remove();
      return {};
    },
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required()
        })
      }
    }
  });

  // Get orders
  server.route({
    method: "GET",
    path: "/api/orders",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }
      const orders = await buildPopulatedOrdersForAccount(user.account);
      return orders;
    }
  });

  // Add order
  server.route({
    method: "POST",
    path: "/api/orders",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }
      const account = await getAccount(user.account);

      let integrationData = {};
      for (const integrationType of INTEGRATION_TYPES) {
        if (integrationType === EASYNC_INTEGRATION_TYPE) {
          integrationData[integrationType] = get(account, [
            "integrationData",
            EASYNC_INTEGRATION_TYPE,
            "orderData"
          ]);
        }
      }
      const order = new Order({
        accountId: user.account,
        integrationData
      });
      await syncOrderEasyncData(order);
      await order.save();
      return await buildPopulatedOrder(order._id);
    }
  });

  // Update order
  server.route({
    method: "PATCH",
    path: "/api/orders/{orderId}",
    handler: async (request, h) => {
      const { orderId } = request.params;
      const { changes } = request.payload;
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }
      let order;
      try {
        order = await Order.findById(orderId);
      } catch (error) {
        console.error(error);
      }
      if (!order) {
        return Boom.badRequest();
      }
      if (!order.accountId.equals(user.account)) {
        return Boom.unauthorized();
      }
      for (const changeKey of Object.keys(changes)) {
        if (changeKey === "integrationData") {
          recursiveMongooseUpdate(
            changes.integrationData,
            order.integrationData
          );
        }
        if (changeKey === "shippingAddress") {
          recursiveMongooseUpdate(
            changes.shippingAddress,
            order.shippingAddress
          );
        }
      }
      await syncOrderEasyncData(order);
      await order.save();
      return await buildPopulatedOrder(orderId);
    },
    options: {
      validate: {
        params: Joi.object({
          orderId: Joi.string().required()
        }),
        payload: Joi.object({
          changes: Joi.object().required()
        })
      }
    }
  });

  // Add orderProduct
  server.route({
    method: "POST",
    path: "/api/orders/{orderId}/products",
    handler: async (request, h) => {
      const { orderId } = request.params;
      const { productId } = request.payload;
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }

      let order;
      try {
        order = await Order.findById(orderId);
      } catch (error) {
        console.error(error);
      }
      if (!order) {
        return Boom.badRequest();
      }
      if (!order.accountId.equals(user.account)) {
        return Boom.unauthorized();
      }

      let product;
      try {
        product = await Product.findById(productId);
      } catch (error) {
        console.error(error);
      }
      if (!product) {
        return Boom.badRequest();
      }
      if (!product.accountId.equals(user.account)) {
        return Boom.unauthorized();
      }

      order.orderProducts.push({
        productId: productId,
        quantity: 1,
        integrationData: {
          [EASYNC_INTEGRATION_TYPE]: {
            selectionCriteria: get(product, [
              "integrationData",
              EASYNC_INTEGRATION_TYPE,
              "orderProductData",
              "selectionCriteria"
            ])
          }
        }
      });
      await syncOrderEasyncData(order);
      await order.save();
      return await buildPopulatedOrder(orderId);
    },
    options: {
      validate: {
        params: Joi.object({
          orderId: Joi.string().required()
        }),
        payload: Joi.object({
          productId: Joi.string().required()
        })
      }
    }
  });

  // Delete orderProduct
  server.route({
    method: "DELETE",
    path: "/api/orders/{orderId}/products/{orderProductId}",
    handler: async (request, h) => {
      const { orderId, orderProductId } = request.params;
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }

      let order;
      try {
        order = await Order.findById(orderId);
      } catch (error) {
        console.error(error);
      }
      if (!order) {
        return Boom.badRequest();
      }
      if (!order.accountId.equals(user.account)) {
        return Boom.unauthorized();
      }

      let orderProduct;
      try {
        orderProduct = await order.orderProducts.id(orderProductId);
      } catch (error) {
        console.error(error);
      }
      if (!orderProduct) {
        return Boom.badRequest();
      }

      orderProduct.remove();
      await syncOrderEasyncData(order);
      await order.save();
      return await buildPopulatedOrder(orderId);
    },
    options: {
      validate: {
        params: Joi.object({
          orderId: Joi.string().required(),
          orderProductId: Joi.string().required()
        })
      }
    }
  });

  // Update orderProduct
  server.route({
    method: "PATCH",
    path: "/api/orders/{orderId}/products/{orderProductId}",
    handler: async (request, h) => {
      const { changes } = request.payload;
      const { orderId, orderProductId } = request.params;

      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }

      let order;
      try {
        order = await Order.findById(orderId);
      } catch (error) {
        console.error(error);
      }
      if (!order) {
        return Boom.badRequest();
      }
      if (!order.accountId.equals(user.account)) {
        return Boom.unauthorized();
      }

      let orderProduct;
      try {
        orderProduct = await order.orderProducts.id(orderProductId);
      } catch (error) {
        console.error(error);
      }
      if (!orderProduct) {
        return Boom.badRequest();
      }

      for (const changeKey of Object.keys(changes)) {
        if (changeKey === "integrationData") {
          recursiveMongooseUpdate(
            changes.integrationData,
            orderProduct.integrationData
          );
        }
        if (changeKey === "quantity") {
          orderProduct.quantity = changes.quantity;
        }
      }

      await syncOrderEasyncData(order);
      await order.save();
      return await buildPopulatedOrder(orderId);
    },
    options: {
      validate: {
        params: Joi.object({
          orderId: Joi.string().required(),
          orderProductId: Joi.string().required()
        }),
        payload: Joi.object({
          changes: Joi.object().required()
        })
      }
    }
  });

  // Get products
  server.route({
    method: "GET",
    path: "/api/products",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }
      const products = getProductsForAccount(user.account);
      return products;
    }
  });

  // Get product
  server.route({
    method: "GET",
    path: "/api/products/{id}",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }
      let product;
      try {
        product = await Product.findById(request.params.id);
      } catch (error) {
        console.error(error);
      }
      if (!product) {
        return Boom.badRequest();
      }
      if (!product.accountId.equals(user.account)) {
        return Boom.unauthorized();
      }
      return product.toObject();
    },
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required()
        })
      }
    }
  });

  // Delete product
  server.route({
    method: "DELETE",
    path: "/api/products/{id}",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }
      let product;
      try {
        product = await Product.findById(request.params.id);
      } catch (error) {
        console.error(error);
      }
      if (!product) {
        return Boom.badRequest();
      }
      if (!product.accountId.equals(user.account)) {
        return Boom.unauthorized();
      }
      await product.remove();
      return {};
    },
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required()
        })
      }
    }
  });

  // Add product
  server.route({
    method: "POST",
    path: "/api/products",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }
      const account = await getAccount(user.account);

      let integrationData = {};
      for (const integrationType of INTEGRATION_TYPES) {
        if (integrationType === EASYNC_INTEGRATION_TYPE) {
          integrationData[integrationType] = {
            orderProductData: get(account, [
              "integrationData",
              EASYNC_INTEGRATION_TYPE,
              "orderProductData"
            ])
          };
        }
      }

      const product = await createProduct({
        accountId: user.account,
        integrationData
      });
      return product.toObject();
    }
  });

  // Update product
  server.route({
    method: "PATCH",
    path: "/api/products/{id}",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }
      const changes = request.payload.changes;
      let product;
      try {
        product = await Product.findById(request.params.id);
      } catch (error) {
        console.error(error);
      }
      if (!product) {
        return Boom.badRequest();
      }
      if (!product.accountId.equals(user.account)) {
        return Boom.unauthorized();
      }
      for (const changeKey of Object.keys(changes)) {
        if (changeKey === "integrationData") {
          recursiveMongooseUpdate(
            changes.integrationData,
            product.integrationData
          );
        }
        if (changeKey === "externalIds") {
          product.externalIds = {
            ...product.externalIds,
            ...changes.externalIds
          };
        }
        if (changeKey === "title") {
          product.title = changes.title;
        }
        if (changeKey === "SKU") {
          const isSKUexists = await Product.findOne({ SKU: changes.SKU });

          if (isSKUexists) {
            return Boom.badRequest("This SKU already exists");
          }

          product.SKU = changes.SKU;
        }
      }
      await product.save();
      return product.toObject();
    },
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required()
        }),
        payload: Joi.object({
          changes: Joi.object().required()
        })
      }
    }
  });

  // Test collect orders
  server.route({
    method: "POST",
    path: "/api/collect-orders",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;

      const user = await getUser(userId);

      if (user.role !== "admin") {
        return Boom.unauthorized();
      }

      const account = await getAccount(user.account);

      if (account.integrations.length === 0) {
        return {};
      }

      for (const integration of account.integrations) {
        if (integration.integrationType === LINNW_INTEGRATION_TYPE) {
          const { appId, credentials, options, session } = integration;
          const appInstallToken =
            credentials && credentials.get("INSTALL_TOKEN");
          if (!appInstallToken) {
            throw Boom.badRequest("No Linnworks Install Token");
          }

          // TODO move somewhere else
          if (!session) {
            const appSecret = cg("LINNW_APP_SECRET");
            const linnworksSession = await makeLinnworksAPISession(
              appId,
              appSecret,
              appInstallToken
            );
            integration.session = linnworksSession;
            await account.save();
          }

          const sessionToken = integration.session.Token;
          const locationId =
            (options && options.defaultLocation) ||
            "00000000-0000-0000-0000-000000000000";
          const someOrders = await getLinnworksOpenOrdersPaged(
            sessionToken,
            locationId,
            15,
            1
          );

          let orderDocs = [];
          for (const inputOrder of someOrders["Data"]) {
            const inputId = inputOrder["OrderId"];
            const existingOrder = await getOrderByLinworkId(inputId);
            if (!existingOrder) {
              const orderDoc = {
                inputId,
                ...convertLinnworksOrder(inputOrder)
              };
              orderDocs.push(orderDoc);
            }
          }

          if (orderDocs.length > 0) {
            createOrders(orderDocs);
          }

          return { numOrdersAdded: orderDocs.length };
        }
      }
    }
  });

  // Add user & linked account
  server.route({
    method: "POST",
    path: "/api/auth/register",
    handler: async (request, h) => {
      const { displayName, email, password } = request.payload;

      if (await getUserByEmail(email)) {
        return Boom.badRequest(ERR_EMAIL_TAKEN);
      }

      const passwordHash = await bcrypt.hash(
        password,
        cg("BCRYPT_SALT_ROUNDS")
      );

      let user;

      try {
        user = await createAdminUser({
          displayName,
          email,
          passwordHash
        });
      } catch (e) {
        if (e instanceof DBValidationError) {
          return Boom.badRequest();
        } else {
          throw e;
        }
      }

      // user was created successfully, now create and link an account
      // TODO can this be done more transaction-like?
      try {
        await createNewLinkedAccount(user);
      } catch (e) {
        console.log("Error creating linked account, deleting admin user...");
        await removeUser(user.id);
        throw e;
      }

      const token = createUserToken(cg, user.id);
      const userDetails = buildUserDetails(user);

      return {
        token,
        user: userDetails
      };
    },
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          displayName: Joi.string()
            .min(2)
            .required(),
          email: Joi.string().required(),
          password: Joi.string()
            .min(6)
            .required()
        })
      }
    }
  });

  // Login with email and password
  server.route({
    method: "POST",
    path: "/api/auth",
    handler: async (request, h) => {
      const { email, password } = request.payload;

      const user = await getUserByEmail(email);

      if (!user) {
        throw Boom.unauthorized(ERR_NO_USER_WITH_EMAIL);
      }

      const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

      if (!passwordsMatch) {
        throw Boom.unauthorized(ERR_WRONG_PASSWORD);
      }

      const token = createUserToken(cg, user.id);
      const userDetails = buildUserDetails(user);

      return {
        token,
        user: userDetails
      };
    },
    options: {
      auth: false,
      validate: {
        payload: Joi.object({
          email: Joi.string().required(),
          password: Joi.string().required()
        })
      }
    }
  });

  // Login with and renew JWT token
  server.route({
    method: "GET",
    path: "/api/auth/access-token",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const userDetails = await getUserDetailsById(userId);
      // give the user a fresh token
      const token = createUserToken(cg, userId);
      return { user: userDetails, token };
    }
  });

  // Get account
  server.route({
    method: "GET",
    path: "/api/account",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }
      const account = await getAccount(user.account);
      return account.toObject();
    }
  });

  // Update account
  server.route({
    method: "PATCH",
    path: "/api/account",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }
      const account = await getAccount(user.account);
      const changes = request.payload.changes;
      for (const changeKey of Object.keys(changes)) {
        if (changeKey === "integrationData") {
          recursiveMongooseUpdate(
            changes.integrationData,
            account.integrationData
          );
        }
      }
      await account.save();
      return account.toObject();
    },
    options: {
      validate: {
        payload: Joi.object({
          changes: Joi.object().required()
        })
      }
    }
  });

  // Add an integration
  server.route({
    method: "POST",
    path: "/api/account/integrations",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }
      const account = await getAccount(user.account);
      try {
        const type = request.payload.type;
        if (type === LINNW_INTEGRATION_TYPE) {
          await addIntegration(account, type, {
            appId: cg("LINNW_APP_ID")
          });
        } else {
          await addIntegration(account, type);
        }
        return {
          integrations: account.integrations.toObject()
        };
      } catch (e) {
        if (e instanceof DBValidationError) {
          return Boom.badRequest();
        } else {
          throw e;
        }
      }
    },
    options: {
      validate: {
        payload: Joi.object({
          type: Joi.string().required()
        })
      }
    }
  });

  // Delete an integration
  server.route({
    method: "DELETE",
    path: "/api/account/integrations",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }
      const account = await getAccount(user.account);
      try {
        await deleteIntegration(account, request.payload.id);
        return {
          integrations: account.integrations.toObject()
        };
      } catch (e) {
        if (e instanceof DBValidationError) {
          return Boom.badRequest();
        } else {
          throw e;
        }
      }
    },
    options: {
      validate: {
        payload: Joi.object({
          id: Joi.string().required()
        })
      }
    }
  });

  // Update an integration
  server.route({
    method: "PATCH",
    path: "/api/account/integrations",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== "admin") {
        return Boom.unauthorized();
      }
      const account = await getAccount(user.account);
      const { id, changes } = request.payload;
      try {
        const integration = await updateIntegration(account, id, changes);
        const integrationsObj = account.integrations.toObject();
        return {
          integration: integration.toJSON(),
          integrations: integrationsObj
        };
      } catch (e) {
        if (e instanceof DBValidationError) {
          return Boom.badRequest();
        } else {
          throw e;
        }
      }
    },
    options: {
      validate: {
        payload: Joi.object({
          id: Joi.string().required(),
          changes: Joi.object().required()
        })
      }
    }
  });

  server.route({
    method: "GET",
    path: "/api/account/refresh-locations",
    handler: async (request, h) => {
      const { authenticatedUserId } = request.headers;
      const user = await getUser(authenticatedUserId);
      const account = await getAccount(user.account);

      if (!account.integrations.length) {
        throw Boom.badRequest('You don\'t have any integrations!');
      }

      const linnwIntegration = account.integrations.find(el => {
        return el.integrationType === LINNW_INTEGRATION_TYPE
      });

      if (!linnwIntegration) {
        throw Boom.badRequest('You don\'t have linnwork integration!');
      }

      const { appId, credentials, session } = linnwIntegration;

      const appInstallToken = credentials && credentials.get("INSTALL_TOKEN");
      if (!appInstallToken) {
        throw Boom.badRequest("No Linnworks Install Token");
      }

      if (!session) {
        const appSecret = cg("LINNW_APP_SECRET");
        const linnworksSession = await makeLinnworksAPISession(
          appId,
          appSecret,
          appInstallToken
        );
        linnwIntegration.session = linnworksSession;
        await account.save();
      }

      const locations = await getLinnworksLocations(linnwIntegration.session.Token);

      if (!locations.length) {
        throw Boom.badRequest('There aren\'t any locations!');
      }

      const linnwIntegrationData = account.integrationData[LINNW_INTEGRATION_TYPE];

      linnwIntegrationData.locations = locations;
      if (
        !linnwIntegrationData.choosedLocation ||
        !locations.find(el => {
          return el.StockLocationId === linnwIntegrationData.choosedLocation.StockLocationId
        })
      ) {
        linnwIntegrationData.choosedLocation = locations[0];
      }

      return await account.save();;
    }
  });

  server.route({
    method: "PUT",
    path: "/api/account/change-location",
    handler: async (request, h) => {
      const { authenticatedUserId } = request.headers;
      const user = await getUser(authenticatedUserId);
      const account = await getAccount(user.account);

      if (!account.integrations.length) {
        throw Boom.badRequest('You don\'t have any integrations!');
      }

      const linnwIntegration = account.integrations.find(el => {
        return el.integrationType === LINNW_INTEGRATION_TYPE
      });

      if (!linnwIntegration) {
        throw Boom.badRequest('You don\'t have linnwork integration!');
      }

      const { StockLocationId } = request.payload;

      const linnwIntegrationData = account.integrationData[LINNW_INTEGRATION_TYPE];

      const newLocation = linnwIntegrationData.locations.find(el =>
        el.StockLocationId === StockLocationId
      );

      if (!newLocation) {
        throw Boom.badRequest('There aren\'t location with this id!');
      }

      linnwIntegrationData.choosedLocation = newLocation;
      await account.save();

      return newLocation;
    },
    options: {
      validate: {
        payload: Joi.object({
          StockLocationId: Joi.string().required()
        })
      }
    }
  });

  server.route({
    method: "GET",
    path: "/api/account/users",
    handler: async (request, h) => {
      const { authenticatedUserId } = request.headers;

      const account = await getUserAccount(authenticatedUserId);

      return getUsers(account.users);
    }
  });

  server.route({
    method: "GET",
    path: "/api/account/retailer-codes",
    handler: async (request, h) => {
      const { authenticatedUserId } = request.headers;

      const user = await getUser(authenticatedUserId);

      return getAccountRetailerCodes(user.account);
    }
  });

  server.route({
    method: "DELETE",
    path: "/api/account/retailer-codes/{retailerCode}",
    handler: async (request, h) => {
      const { authenticatedUserId } = request.headers;
      const { retailerCode } = request.params;

      const account = await getUserAccount(authenticatedUserId);

      return deleteAccountRetailerCode(account._id, retailerCode);
    }
  });

  server.route({
    method: "PUT",
    path: "/api/account/retailer-codes/{retailerCode}",
    handler: async (request, h) => {
      const { payload } = request;
      const { authenticatedUserId } = request.headers;
      const { retailerCode } = request.params;

      const account = await getUserAccount(authenticatedUserId);

      return updateAccountRetailerCode(account._id, retailerCode, payload);
    }
  });

  server.route({
    method: "GET",
    path: "/api/account/countries",
    handler: async (request, h) => {
      const { authenticatedUserId } = request.headers;

      const user = await getUser(authenticatedUserId);

      return getAccountCountries(user.account);
    }
  });

  server.route({
    method: "POST",
    path: "/api/webhooks/order_placed",
    options: { auth: false },
    handler: async (request, h) => {
      const collection = global.dbConnection.db('test1').collection('temp');

      const payload = {};

      payload.headers = request.headers;
      payload.query = request.query;
      payload.payload = request.payload;
      payload.date = new Date();

      collection.insertOne(payload);

      return { success: true };
    }
  });

  server.route({
    method: "POST",
    path: "/api/webhooks/order_failed",
    options: { auth: false },
    handler: async (request, h) => {
      const collection = global.dbConnection.db('test1').collection('temp');

      const payload = {};

      payload.headers = request.headers;
      payload.query = request.query;
      payload.payload = request.payload;
      payload.date = new Date();

      collection.insertOne(payload);

      return { success: true };
    }
  });

  server.route({
    method: "POST",
    path: "/api/webhooks/tracking_obtained",
    options: { auth: false },
    handler: async (request, h) => {
      const collection = global.dbConnection.db('test1').collection('temp');

      const payload = {};

      payload.headers = request.headers;
      payload.query = request.query;
      payload.payload = request.payload;
      payload.date = new Date();

      collection.insertOne(payload);

      return { success: true };
    }
  });

  server.route({
    method: "POST",
    path: "/api/webhooks/status_updated",
    options: { auth: false },
    handler: async (request, h) => {
      const collection = global.dbConnection.db('test1').collection('temp');

      const payload = {};

      payload.headers = request.headers;
      payload.query = request.query;
      payload.payload = request.payload;
      payload.date = new Date();

      collection.insertOne(payload);

      return { success: true };
    }
  });

  return server;
}
