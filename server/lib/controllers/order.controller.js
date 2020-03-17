import _ from "lodash";
import { Order } from "../models/order.model.js";
import mongoose from "mongoose";
import {
  buildEasyncOrderData,
  buildEasyncOrderProductData,
  EASYNC_INTEGRATION_TYPE
} from "../integrations/easync/easync.js";
import { getStatusByRequestId } from "../integrations/easync/getEasyncOrdedStatus.js";
import { Product } from "../models/product.model.js";
import { EASYNC_ORDER_RESPONSE_CODES, EASYNC_ORDER_RESPONSE_TYPES } from "../integrations/easync/easync.js";

const orderProductJoinProductLookup = {
  from: "products",
  localField: "orderProducts.productId",
  foreignField: "_id",
  as: "products"
};

export async function getOrder(orderId) {
  const order = await Order.findById(orderId);
  return order;
}

export async function getOrderByInputId(inputId) {
  const order = await Order.findOne({ inputId });
  return order;
}

export async function getAllOrdersByStatus(status) {
  const orders = await Order.find({ "easyncOrderStatus.status": status });

  console.log(orders.length);

  return orders;
}

export async function updateOrderById(orderId, { requestId = null, status = null, idempotencyKey = null }) {
  if (!orderId) {
    throw new Error("Order id not exist");
  }

  const order = await Order.findById(orderId);

  let easyncOrderStatus = {};

  if (Object.keys(order.easyncOrderStatus).length) {
    easyncOrderStatus = order.easyncOrderStatus.toObject();
  }

  if (requestId)
    easyncOrderStatus.requestId = requestId;

  if (status)
    easyncOrderStatus.status = status;

  if (idempotencyKey)
    easyncOrderStatus.idempotencyKey = idempotencyKey;

  if (Object.keys(easyncOrderStatus).length) {
    await Order.updateOne(
        { _id: orderId },
        { $set: { easyncOrderStatus }}
    );
  }
}

export function awaitCheckAndUpdateOrder({ orderId, requestId, token }) {

  if (!token || !orderId && !requestId) return null;

  setTimeout(async () => {
    const data = await getStatusByRequestId(requestId);

    const { _type, code } = data;

    if (_type === EASYNC_ORDER_RESPONSE_TYPES.SUCCESS) {
      return await updateOrderById(orderId, {
        requestId,
        status: EASYNC_ORDER_RESPONSE_TYPES.SUCCESS,
      })
    }

    if (_type === EASYNC_ORDER_RESPONSE_TYPES.ERROR && code !== EASYNC_ORDER_RESPONSE_CODES.IN_PROCESSING) {
      return await updateOrderById(orderId, {
        requestId,
        status: EASYNC_ORDER_RESPONSE_CODES.IN_PROCESSING,
      })
    }


    return await updateOrderById(orderId, {
      requestId,
      status: EASYNC_ORDER_RESPONSE_TYPES.ERROR,
    });

  }, 15000)
}

export async function createOrders(docs) {
  await Order.create(docs);
}

function moveProductDataIntoOrderProducts(order) {
  order.orderProducts.forEach(orderProduct => {
    orderProduct.product = _.find(order.products, product =>
      product._id.equals(orderProduct.productId)
    );
  });
  delete order.products;
}

export async function buildPopulatedOrdersForAccount(accountId) {
  const orders = await Order.aggregate([
    {
      $match: {
        accountId: mongoose.Types.ObjectId(accountId)
      }
    },
    {
      $lookup: orderProductJoinProductLookup
    }
  ]);
  orders.forEach(moveProductDataIntoOrderProducts);
  return orders;
}

export async function buildPopulatedOrder(orderId) {
  const order = _.first(
    await Order.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(orderId)
        }
      },
      {
        $lookup: orderProductJoinProductLookup
      }
    ])
  );
  moveProductDataIntoOrderProducts(order);
  return order;
}

// TODO need a better approach
export async function syncOrderEasyncData(order) {
  order["integrationData"][EASYNC_INTEGRATION_TYPE] = buildEasyncOrderData(
    order
  );
  const arrayPromises = order.orderProducts.map(async orderProduct => {
    const product = await Product.findById(orderProduct.productId);
    const { externalId } = buildEasyncOrderProductData(
      order,
      product,
      orderProduct
    );
    await Order.updateOne(
      {
        "_id": order._id,
        "orderProducts._id": orderProduct._id
      },
      {
        "$set": {
          "orderProducts.$.integrationData.EASYNC.externalId": externalId
        }
      }
    );
  });

  await Promise.all(arrayPromises);
}
