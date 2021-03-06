import mongoose from "mongoose";
import "mongoose-type-email";
import { LINNW_INTEGRATION_TYPE, DEFAULT_LOCATION } from "../integrations/linnworks.js";
import { EASYNC_INTEGRATION_TYPE, easyncAccountDataShape } from "../integrations/easync/easync.js";

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
  session: {},
  // TODO generalize, this is specific to Linnworks
  appId: String,
  credentials: {
    type: Map,
    of: String
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
  },
  integrationData: {
    [EASYNC_INTEGRATION_TYPE]: easyncAccountDataShape,
    [LINNW_INTEGRATION_TYPE]: {
      locations: {
        type: Array,
        default: [DEFAULT_LOCATION]
      },
      choosedLocation: { 
        type: mongoose.SchemaTypes.Mixed,
        default: DEFAULT_LOCATION
      }
    }
  }
}, {toObject: {flattenMaps: true}});

export const Account = mongoose.model("Account", AccountSchema);
