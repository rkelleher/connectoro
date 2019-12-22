import mongoose from "mongoose";

// TODO move relevant specs into the integration files
import { EASYNC_INTEGRATION_TYPE } from "../integrations/easync.js";
import { LINNW_INTEGRATION_TYPE } from "../integrations/linnworks.js";

const ExampleOrder = {
  _id: 'abcdefg',
  products: [
    {
      quantity: 1,
      productId: "abc123",
      integrationData: {
        'EASYNC': {
          selectionCriteria: {
            conditionIn: ['New'],
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
    'EASYNC': {
      shippingMethod: 'free',
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
  quantity: Number,
  integrationData: {
    [EASYNC_INTEGRATION_TYPE]: {
      selectionCriteria: {
        conditionIn: [String],
        handlingDaysMax: Number,
        maxItemPrice: Number,
        isPrime: Boolean
      }
    }
  }
});

const AddressSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  addressLine1: String,
  addressLine2: String,
  zipCode: String,
  city: String,
  state: String,
  countryName: String,
  phoneNumber: String,
});

const OrderSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  orderProducts: [OrderProductSchema],
  shippingAddress: AddressSchema,
  integrationData: {
    [EASYNC_INTEGRATION_TYPE]: {
      retailer: String,
      giftMessage: String,
      isGift: Boolean,
      maxOrderPrice: Number,
      isFBE: Boolean,
      isPrime: Boolean,
      clientNotes: String
    },
    [LINNW_INTEGRATION_TYPE]: {
      inputOrder: {}
    }
  }
});

export const Order = mongoose.model("Order", OrderSchema);
