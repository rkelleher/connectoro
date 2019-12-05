import mongoose from "mongoose";
import "mongoose-type-email";

const UserSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true
  },
  email: {
    type: mongoose.SchemaTypes.Email,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

export const User = mongoose.model("users", UserSchema);
