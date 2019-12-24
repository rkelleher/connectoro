import mongoose from "mongoose";

import {
  EASYNC_INTEGRATION_TYPE,
  productDataShape
} from "../integrations/easync.js";

const ProductExample = {
  _id: "abcdefg",
  title: "Example Product",
  integrationData: {
    "EASYNC": {
      amazonIds: {
        "amazon_uk": "ABC123"
      }
    }
  }
};

const ProductShape = {
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    default: ""
  },
  integrationData: {
    [EASYNC_INTEGRATION_TYPE]: productDataShape
  }
};

const ProductSchema = new mongoose.Schema(ProductShape, { minimize: false });

export const Product = mongoose.model("Product", ProductSchema);
