import mongoose from "mongoose";

// TODO move relevant specs into integration file
import { EASYNC_INTEGRATION_TYPE, productDataShape } from "../integrations/easync";

const ProductExample = {
  _id: "abcdefg",
  title: "Example Product",
  integrationData: {
    'EASYNC': {
      amazonIds: {
        "amazon_uk": 'ABC123'
      }
    }
  }
};

const ProductShape = {
  title: String,
  integrationData: {
    [EASYNC_INTEGRATION_TYPE]: productDataShape
  }
};

const ProductSchema = new mongoose.Schema(ProductShape);

export const Product = mongoose.model("Product", ProductSchema);
