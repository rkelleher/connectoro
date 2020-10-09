import mongoose from "mongoose";

import {
  EASYNC_INTEGRATION_TYPE,
  easyncOrderDataShape,
  easyncOrderProductDataShape,
  EASYNC_ORDER_STATUSES
} from "../integrations/easync/easync.js";
import { LINNW_INTEGRATION_TYPE, linnwOrderDataShape } from "../integrations/linnworks.js";

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
  easyncTracking: {
    isObtained: {
      type: Boolean,
      default: false
    },
    status: {
      type: String
    },
    trackingNumber: {
      type: String
    }
  },
  easyncOrderStatus: {
    requestId: {
      type: String
    },
    status: {
      type: String,
      default: EASYNC_ORDER_STATUSES.OPEN
    },
    message: {
      type: String
    },
    idempotencyKey: {
      type: String
    },
    request: mongoose.Schema.Types.Mixed,
    tracking: mongoose.Schema.Types.Mixed
  },
  orderProducts: [OrderProductSchema],
  orderStatus: String,
  processedOnSource: {
    type: Boolean,
    default: false
  },
  shippingAddress: {
    type: AddressSchema,
    default: () => ({})
  },
  integrationData: {
    [EASYNC_INTEGRATION_TYPE]: easyncOrderDataShape,
    [LINNW_INTEGRATION_TYPE]: linnwOrderDataShape
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

export const Order = mongoose.model("Order", OrderSchema);
