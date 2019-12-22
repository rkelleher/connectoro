import { Product } from "../models/product.model";

export async function getProduct(productId) {
  const product = await Product.findById(productId);
  return product;
}
