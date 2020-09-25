import _ from "lodash";
import countryDetails from "../../countryDetails.js";

// https://developer.easync.io/?javascript

export const EASYNC_INTEGRATION_TYPE = "EASYNC";
export const EASYNC_TOKEN_CREDENTIAL_KEY = "API_TOKEN";
export const EASYNC_ORDER_STATUSES = {
  OPEN: 'open',
  PROCESSING: 'processing',
  ERROR: 'error',
  AWAITING_TRACKER: 'awaiting_tracker',
  COMPLETE: 'complete'
};
export const EASYNC_ORDER_RESPONSE_TYPES = {
    ERROR: "error",
    SUCCESS: "order_response",
};
export const EASYNC_ORDER_RESPONSE_CODES = {
    IN_PROCESSING: "request_processing",
};
export const EASYNC_ORDER_TRACKING_TYPES = {
  SUCCESS: 'success'
};

export const easyncOrderProductDataShape = {
  externalId: String,
  selectionCriteria: {
    conditionIn: {
      type: [String],
      default: ['New']
    },
    handlingDaysMax: {
      type: Number,
      default: 4
    },
    maxItemPrice: {
      type: Number,
      default: 1339
    },
    isPrime: {
      type: Boolean,
      default: true
    }
  }
};

export const easyncOrderDataShape = {
  retailerCode: {
    type: String,
    default: ""
  },
  shippingMethod: {
    type: String,
    default: "free"
  },
  countryCode: {
    type: String,
    default: ""
  },
  isGift: {
    type: Boolean,
    default: true
  },
  isFBE: {
    type: Boolean,
    default: true
  },
  maxOrderPrice: {
    type: Number,
    default: 2199
  }
};

export const easyncAccountDataShape = {
  orderProductData: easyncOrderProductDataShape,
  orderData: easyncOrderDataShape
};

export const easyncProductDataShape = {
  orderProductData: easyncOrderProductDataShape
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
    countryCodes: ["DE", "AT", "BE", "NL", "LU"]
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

// assigns each order-product the corresponding ASIN for the order's Easync site
export const buildEasyncOrderProductData = (order, product, orderProduct) => {
  const prevData = _.get(orderProduct, easyncPath);
  const retailerCode = _.get(order, [...easyncPath, "retailerCode"]);
  const externalId = _.get(product, ["externalIds", retailerCode]);
  return { ...prevData, externalId };
};

// TODO memoize countryCode for performance (or move into db and pass in as options)
export const buildEasyncOrderData = order => {
  const prevData = _.get(order, easyncPath);
  const countryName = _.get(order, ["shippingAddress", "countryName"]);
  const countryCode = findTwoLetterCountryCode(countryName);
  const retailerCode = determineEasyncOrderRetailerCode(countryCode);
  return {
    ...prevData,
    countryCode,
    retailerCode
  };
};

export function mapEasyncStatus(request) {
  const base = { request };

  if (request.code && request.code === EASYNC_ORDER_RESPONSE_CODES.IN_PROCESSING) {
    return {
      ...base,
      status: EASYNC_ORDER_STATUSES.PROCESSING,
      message: request.message
    };
  }

  switch (request._type) {
    case EASYNC_ORDER_RESPONSE_TYPES.SUCCESS:
      if (request.tracking) {
        return {
          ...base,
          processedOnSource: true,
          status: EASYNC_ORDER_STATUSES.COMPLETE,
          message: request.message
        };
      } else {
        return {
            ...base,
            status: EASYNC_ORDER_STATUSES.AWAITING_TRACKER,
            message: request.message
        };
      }
    case EASYNC_ORDER_RESPONSE_TYPES.ERROR:
      return {
        ...base,
        status: EASYNC_ORDER_STATUSES.ERROR,
        message: request.message
      };
  } 
}
