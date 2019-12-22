import mongoose from "mongoose";

// TODO move relevant specs into integration file
import { EASYNC_INTEGRATION_TYPE } from "../integrations/easync";

const ProductExample = {
  _id: "abcdefg",
  title: "Example Product",
  integrationData: {
    'EASYNC': {
      ids: {
        "amazon_uk": 'ABC123'
      }
    }
  }
};

const ProductShape = {
  title: String,
  integrationData: {
    [EASYNC_INTEGRATION_TYPE]: {
      ids: {}
    }
  }
};

const ProductSchema = new mongoose.Schema(ProductShape);

export const Product = mongoose.model("Product", ProductSchema);
