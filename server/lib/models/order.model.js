import mongoose from "mongoose";

import {
  EASYNC_INTEGRATION_TYPE,
  orderProductDataShape,
  orderDataShape
} from "../integrations/easync.js";

const ExampleOrder = {
  _id: "abcdefg",
  accountId: "hijklmn",
  orderProducts: [
    {
      quantity: 1,
      productId: "abc123",
      integrationData: {
        "EASYNC": {
          selectionCriteria: {
            conditionIn: ["New"],
            handlingDaysMax: 4,
            maxItemPrice: 9900,
            isPrime: true
          }
        }
      }
    }
  ],
  shippingAddress: {
    firstName: "khurram",
    lastName: "shahzad",
    addressLine1: "107 Bonnyton Road",
    addressLine2: "",
    zipCode: "KA1 2NB",
    city: "Kilmarnock",
    state: "East Ayrshire",
    country: "United Kingdom",
    phoneNumber: "7563406968"
  },
  integrationData: {
    "EASYNC": {
      shippingMethod: "free",
      isGift: true,
      maxOrderPrice: 9900,
      clientNotes: {
        "our_internal_order_id": "384460"
      },
      isFBE: true
    }
  }
};

const OrderProductSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  quantity: {
    type: Number,
    default: 1
  },
  integrationData: {
    [EASYNC_INTEGRATION_TYPE]: orderProductDataShape
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
  shippingAddress: {
    type: AddressSchema,
    default: () => ({})
  },
  integrationData: {
    [EASYNC_INTEGRATION_TYPE]: orderDataShape
  }
});

export const Order = mongoose.model("Order", OrderSchema);
