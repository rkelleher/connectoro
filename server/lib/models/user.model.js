import mongoose from "mongoose";
import "mongoose-type-email";

export const USER_ROLES = ['admin'];

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
  },
  role: {
    type: String,
    enum: USER_ROLES,
    required: true
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  }
});

export const User = mongoose.model("User", UserSchema);
