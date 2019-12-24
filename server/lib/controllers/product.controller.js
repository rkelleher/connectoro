import { Product } from "../models/product.model.js";
import _ from 'lodash';

export async function createProduct(obj) {
  const product = new Product(obj);
  await product.save();
  return product;
}

export async function getProduct(productId) {
  const product = await Product.findById(productId);
  return product;
}

export async function getProductsForAccount(accountId) {
  const product = Product.find({ accountId });
  return product;
}
