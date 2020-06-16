import mongoose from "mongoose";

const retailerCode = {
  retailerName: {
    type: String,
    default: ""
  },
  retailerCode: {
    type: String,
    default: "",
    unique: true
  },
  retailerIcon: {
    type: String,
    default: ""
  },
  retailerFlag: {
    type: String,
    default: ""
  }
};

const DefaultRetailerCodeSchema= new mongoose.Schema({
  accountId: mongoose.Schema.Types.ObjectId,
  retailerCodes: [retailerCode]
});

const RetailerCodeSchema= new mongoose.Schema(retailerCode);

export const DefaultRetailerCode = mongoose.model("default_retailer_code", RetailerCodeSchema);
export const RetailerCode = mongoose.model("retailer_code", DefaultRetailerCodeSchema);
