import mongoose from "mongoose";
import "mongoose-type-email";
import { LINNW_INTEGRATION_TYPE } from "../integrations/linnworks.js";
import { EASYNC_INTEGRATION_TYPE } from "../integrations/easync.js";

export const INTEGRATION_TYPES = [
  LINNW_INTEGRATION_TYPE,
  EASYNC_INTEGRATION_TYPE
];

const IntegrationSchema = new mongoose.Schema({
  integrationType: {
    type: String,
    enum: INTEGRATION_TYPES,
    required: true
  },
  // TODO generalize, this is specific to Linnworks
  appId: {
    type: String
  },
  credentials: {
    type: Map,
    of: String
  },
  optionChoices: {
    type: Map,
    of: Object
  }
}, {toObject: {flattenMaps: true}});

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
