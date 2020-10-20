
import mongoose from "mongoose";


const LogSchema = new mongoose.Schema({
  log: {
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

export const Log = mongoose.model("Log", LogSchema);