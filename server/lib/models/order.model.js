import mongoose from "mongoose";

import {
  EASYNC_INTEGRATION_TYPE,
  easyncOrderDataShape,
  easyncOrderProductDataShape
} from "../integrations/easync/easync.js";

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
  easyncOrderStatus: {
    requestId: String,
    status: String,
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

export const Order = mongoose.model("Order", OrderSchema);
