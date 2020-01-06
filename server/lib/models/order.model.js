import mongoose from "mongoose";

import {
  EASYNC_INTEGRATION_TYPE,
  easyncOrderDataShape,
  easyncOrderProductDataShape,
  buildEasyncOrderData,
  buildEasyncOrderProductData
} from "../integrations/easync/easync.js";
import { Product } from "./product.model.js";

const OrderProductSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  quantity: {
    type: Number,
    default: 1
  },
  integrationData: {
    [EASYNC_INTEGRATION_TYPE]: easyncOrderProductDataShape
  }
});

const AddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    default: ""
  },
  lastName: {
    type: String,
    default: ""
  },
  addressLine1: {
    type: String,
    default: ""
  },
  addressLine2: {
    type: String,
    default: ""
  },
  addressLine3: {
    type: String,
    default: ""
  },
  zipCode: {
    type: String,
    default: ""
  },
  city: {
    type: String,
    default: ""
  },
  state: {
    type: String,
    default: ""
  },
  countryName: {
    type: String,
    default: ""
  },
  phoneNumber: {
    type: String,
    default: ""
  }
});

const OrderSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  orderProducts: [OrderProductSchema],
  orderStatus: String,
  shippingAddress: {
    type: AddressSchema,
    default: () => ({})
  },
  integrationData: {
    [EASYNC_INTEGRATION_TYPE]: easyncOrderDataShape
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

// TODO check that easync is an active integration?
// TODO what's a safer appoach to keeping this data in sync?
OrderSchema.pre("save", async function() {
  const order = this;
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
});

export const Order = mongoose.model("Order", OrderSchema);
