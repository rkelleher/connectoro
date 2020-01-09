import mongoose from "mongoose";

import {
  EASYNC_INTEGRATION_TYPE,
  easyncProductDataShape
} from "../integrations/easync/easync.js";

const ProductShape = {
  createdDate: {
    type: Date,
    default: Date.now
  },
  SKU: "",
  description: "",
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    default: ""
  },
  externalIds: {
    type: Object,
    default: () => ({})
  },
  integrationData: {
    [EASYNC_INTEGRATION_TYPE]: easyncProductDataShape
  },
};

const ProductSchema = new mongoose.Schema(ProductShape, { minimize: false });

export const Product = mongoose.model("Product", ProductSchema);
