import _ from "lodash";

import countryDetails from "../../countryDetails.js";

// https://developer.easync.io/?javascript

export const EASYNC_INTEGRATION_TYPE = "EASYNC";
export const EASYNC_TOKEN_CREDENTIAL_KEY = "API_TOKEN";

export const easyncOrderProductData = {
  externalId: String,
  selectionCriteria: {
    conditionIn: [String],
    handlingDaysMax: {
      type: Number,
      default: 0
    },
    maxItemPrice: {
      type: Number,
      default: 0
    },
    isPrime: {
      type: Boolean,
      default: false
    }
  }
};

export const easyncOrderData = {
  retailerCode: {
    type: String,
    default: ""
  },
  countryCode: {
    type: String,
    default: ""
  },
  isGift: {
    type: Boolean,
    default: false
  },
  isFBE: {
    type: Boolean,
    default: false
  },
  maxOrderPrice: {
    type: Number,
    default: 0
  },
  clientNotes: {
    type: String,
    default: ""
  }
};

export const easyncAccountDataShape = {
  orderProductData: easyncOrderProductData,
  orderData: easyncOrderData
};

export const easyncProductDataShape = {
  orderProductData: easyncOrderProductData
};

// http://www.theodora.com/country_digraphs.html
const findTwoLetterCountryCode = countryName =>
  _.get(
    _.find(countryDetails, ({ name }) => name === countryName),
    "alpha2"
  );

// TODO move into db
const retailerCodes = {
  "amazon_uk": {
    countryCodes: ["GB", "IE"]
  },
  "amazon_de": {
    countryCodes: ["DE"]
  },
  "amazon_fr": {
    countryCodes: ["FR"]
  },
  "amazon_it": {
    countryCodes: ["IT"]
  },
  "amazon_es": {
    countryCodes: ["ES"]
  },
  "amazon": {
    countryCodes: ["US"]
  },
  "amazon_ca": {
    countryCodes: ["CA"]
  }
};

// TODO otherwise use a default country?
const determineEasyncOrderRetailerCode = countryCode => {
  return _.find(Object.keys(retailerCodes), retailerCode =>
    _.includes(retailerCodes[retailerCode].countryCodes, countryCode)
  );
};

const easyncPath = ["integrationData", EASYNC_INTEGRATION_TYPE];

export const getEasyncExternalId = orderProduct =>
  _.get(orderProduct, [...easyncPath, "externalId"]);

export const getEasyncSelectionCriteria = orderProduct =>
  _.get(orderProduct, [...easyncPath, "selectionCriteria"]);

export const getEasyncOrderData = order => _.get(order, easyncPath);

export const syncEasyncOrderProductData = (order, product, orderProduct) => {
  const data = _.get(orderProduct, easyncPath);
  const retailerCode = _.get(order, [...easyncPath, "retailerCode"]);
  const externalId = _.get(product, ["externalIds", retailerCode]);
  Object.assign(data, { externalId });
};

// TODO memoize countryCode for performance
// TODO what's a safer appoach to keeping this data in sync?
export const syncEasyncOrderData = order => {
  const prevData = _.get(order, easyncPath);
  const countryName = _.get(order, ["shippingAddress", "countryName"]);
  const countryCode = findTwoLetterCountryCode(countryName);
  const retailerCode = determineEasyncOrderRetailerCode(countryCode);

  order["integrationData"][EASYNC_INTEGRATION_TYPE] = {
    ...prevData,
    countryCode,
    retailerCode
  };
};