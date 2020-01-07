import _ from "lodash";
import { Order } from "../models/order.model.js";
import mongoose from "mongoose";
import {
  buildEasyncOrderData,
  buildEasyncOrderProductData,
  EASYNC_INTEGRATION_TYPE
} from "../integrations/easync/easync.js";
import { Product } from "../models/product.model.js";

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
  order.orderProducts.forEach(async orderProduct => {
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
}
