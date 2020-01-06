import _ from "lodash";
import { Order } from "../models/order.model.js";
import mongoose from "mongoose";

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

// rather than match array indexes later
function moveProductDataIntoOrderProducts(order) {
  order.orderProducts.forEach((orderProduct, index) => {
    orderProduct.product = order.products[index];
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
