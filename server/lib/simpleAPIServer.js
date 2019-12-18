import Hapi from '@hapi/hapi';
import Joi from '@hapi/joi';
import Boom from '@hapi/boom';
import Hoek from '@hapi/hoek';
const { assert } = Hoek;
import bcrypt from 'bcrypt';
import hapiJWT from "hapi-auth-jwt2";

import { createUserToken, validateToken } from './auth.js';
import {
  buildUserDetails,
  getUserDetailsById,
  getUserByEmail,
  createAdminUser,
  removeUser,
  getUser
} from './controllers/user.controller.js';
import {
  createNewLinkedAccount,
  getAccount,
  buildAccountDetails, 
  addIntegration,
  deleteIntegration,
  updateIntegration
} from "./controllers/account.controller.js";
import { DBValidationError } from './services/database.js';
import { LINNW_INTEGRATION_TYPE } from './integrations/linnworks.js';

const ERR_NO_USER_WITH_EMAIL = 'ERR_NO_USER_WITH_EMAIL';
const ERR_EMAIL_TAKEN = 'ERR_EMAIL_TAKEN';
const ERR_WRONG_PASSWORD = 'ERR_WRONG_PASSWORD'

export async function buildSimpleAPIServer(cg, db) {
  assert(cg && db, 'Missing params');

  const server = Hapi.server({
    port: cg('PORT'),
    host: cg('HTTP_SERVER_HOST'),
    routes: {
      cors: cg('NODE_ENV') === 'development'
    }
  });

  server.app.db = db;

  await server.register(hapiJWT);

  const JWT_SECRET = cg('JWT_SECRET');

  assert(JWT_SECRET, 'Missing JWT secret');

  server.auth.strategy("jwt", "jwt", {
    key: JWT_SECRET,
    validate: validateToken,
    verifyOptions: {algorithms: [cg('JWT_ALGORITH')]},
    tokenType: "Bearer"
  });

  server.auth.default("jwt");

  // Create a new user
  server.route({
    method: "POST",
    path: "/api/auth/register",
    handler: async (request, h) => {
      const {displayName, email, password} = request.payload;
      
      if (await getUserByEmail(email)) {
        return Boom.badRequest(ERR_EMAIL_TAKEN);
      }

      const passwordHash = await bcrypt.hash(password, cg('BCRYPT_SALT_ROUNDS'));

      let user;

      try {
        user = await createAdminUser({
          displayName,
          email,
          passwordHash
        });
      } catch(e) {
        if (e instanceof DBValidationError) {
          return Boom.badRequest()
        } else {
          throw e;
        }
      }

      // user was created successfully, now create and link an account 
      // TODO can this be done more transaction-like?
      try {
        await createNewLinkedAccount(user);
      } catch (e) {
        console.log('Error creating linked account, deleting admin user...')
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
          displayName: Joi.string().min(2).required(),
          email: Joi.string().required(),
          password: Joi.string().min(6).required(),
        })
      }
    }
  });

  // Login with email and password
  server.route({
    method: "POST",
    path: "/api/auth",
    handler: async (request, h) => {
      const {email, password} = request.payload;

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
      return {user: userDetails, token};
    }
  });

  // Update user details
  server.route({
    method: "POST",
    path: "/api/auth/user/update",
    handler: async (request, h) => {
      // TODO save user updates
      throw new Boom.notImplemented();
    }
  });

  // Get account details
  server.route({
    method: 'GET',
    path: "/api/account",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== 'admin') {
        return Boom.unauthorized();
      } 
      const account = await getAccount(user.account);
      return buildAccountDetails(account);
    }
  });

  // Add an integration
  server.route({
    method: 'POST',
    path: "/api/account/integrations",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== 'admin') {
        return Boom.unauthorized();
      } 
      const account = await getAccount(user.account);
      try {
        const type = request.payload.type;
        if (type === LINNW_INTEGRATION_TYPE) {
          await addIntegration(account, type, {
            appId: cg('LINNW_APP_ID')
          })
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
          type: Joi.string().required(),
        })
      }
    }
  });

  // Delete an integration
  server.route({
    method: 'DELETE',
    path: "/api/account/integrations",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== 'admin') {
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
    method: 'PATCH',
    path: "/api/account/integrations",
    handler: async (request, h) => {
      const userId = request.headers.authenticatedUserId;
      const user = await getUser(userId);
      if (user.role !== 'admin') {
        return Boom.unauthorized();
      } 
      const account = await getAccount(user.account);
      const { id, changes } = request.payload;
      try {
        const integration = await updateIntegration(account, id, changes)
        const integrationsObj = account.integrations.toObject()
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

  return server;
}
