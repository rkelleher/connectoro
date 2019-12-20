import { Order } from '../models/order.model.js';

export async function getOrder(orderId) {
  const order = await Order.findById(orderId);
  return order;
}

export async function getOrderByInputId(inputId) {
  const order = await Order.findOne({ inputId });
  return order;
}

export async function getOrdersForAccount(accountId) {
  const orders = Order.find({ accountId });
  return orders;
}

export async function createOrders(docs) {
  await Order.create(docs);
}
