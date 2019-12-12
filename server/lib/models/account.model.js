import mongoose from "mongoose";

export const INTEGRATION_TYPES = ['LINNW', 'EASYNC'];

const IntegrationSchema = new mongoose.Schema({
  integrationType: {
    type: String,
    enum: INTEGRATION_TYPES,
    required: true
  },
  credentials: {
    type: Map,
    of: String
  },
  optionChoices: {
    type: Map,
    of: Object
  }
});

const AccountSchema = new mongoose.Schema({
  email: {
    type: mongoose.SchemaTypes.Email,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  integrations: {
    type: [IntegrationSchema]
  },
  users: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    required: true
  }
});

export const Account = mongoose.model("Account", AccountSchema);
