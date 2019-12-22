import _ from "lodash";

import countryCodes from "../countryCodes.js";

const get = _.get;
const keys = _.keys;
const find = _.find;
const map = _.map;

// https://developer.easync.io/?javascript

export const EASYNC_INTEGRATION_TYPE = "EASYNC";
export const EASYNC_TOKEN_CREDENTIAL_KEY = "API_TOKEN";

const ExampleEasyncOrderReqObj = {
  "idempotency_key": "abcdefg-attempt1",
  "retailer": "amazon_uk",
  "products": [
    {
      "product_id": "B07D61RKCS",
      "quantity": 1,
      "seller_selection_criteria": {
        "condition_in": ["New"],
        "handling_days_max": 4,
        "max_item_price": 9900,
        "prime": true
      }
    }
  ],
  "max_price": 9900,
  "shipping_address": {
    "first_name": "khurram",
    "last_name": "shahzad",
    "address_line1": "107 Bonnyton Road",
    "address_line2": "",
    "zip_code": "KA1 2NB",
    "city": "Kilmarnock",
    "state": "East Ayrshire",
    "country": "GB",
    "phone_number": "7563406968"
  },
  "is_gift": true,
  "shipping_method": "free",
  "fbe": true,

  "client_notes": {
    "our_internal_order_id": "384460"
  }
};

export const orderProductDataShape = {
  selectionCriteria: {
    conditionIn: [String],
    handlingDaysMax: Number,
    maxItemPrice: Number,
    isPrime: Boolean
  }
};

export const productDataShape = {
  amazonIds: {},
  defaults: orderProductDataShape
};

export function getCountryCode(country) {
  // http://www.theodora.com/country_digraphs.html
  return find(countryCodes, x => x.name === country).alpha2;
}

// TODO more codes
const retailerCodes = {
  "amazon_uk": {
    countryName: "United Kingdom",
    countryISOCode: "GB"
  }
};

function getRetailerCode(order) {
  const orderCountry = get(order, ["shippingAddress", "country"]);
  return find(
    keys(retailerCodes),
    retailerCode => retailerCode.countryName === orderCountry
  );
}

function getASIN(order, orderProduct) {
  return get(orderProduct, [
    "integrationData",
    "EASYNC",
    "amazonIds",
    getRetailerCode(order),
    "ASIN"
  ]);
}

const buildWebhooksObj = webhooks => ({
  "order_placed": webhooks.orderPlaced,
  "order_failed": webhooks.orderFailed,
  "tracking_obtained": webhooks.trackingObtained,
  "status_updated": webhooks.statusUpdated
});

const buildSellerSelectionCriteraObj = orderProduct => {
  const criteria = get(orderProduct, [
    "integrationData",
    EASYNC_INTEGRATION_TYPE,
    "selectionCriteria"
  ]);
  return {
    "condition_in": criteria.conditionIn,
    "handling_days_max": criteria.handlingDaysMax,
    "max_item_price": criteria.maxItemPrice,
    "prime": criteria.isPrime
  };
};

const buildOrderProductObj = (order, orderProduct) => ({
  "product_id": getASIN(order, orderProduct),
  "quantity": orderProduct.quantity,
  "seller_selection_criteria": buildSellerSelectionCriteraObj(orderProduct)
});

const buildAddressObj = address => ({
  "first_name": address.firstName,
  "last_name": address.lastName,
  "address_line1": address.addressLine1,
  "address_line2": address.addressLine2,
  "zip_code": address.zipCode,
  "city": address.city,
  "state": address.state,
  "country": getCountryCode(address.countryName),
  // TODO Germany-specific privacy laws?
  "phone_number": address.phoneNumber
});

export function buildEasyncOrderReq(order, reqOptions) {
  const { orderProducts, shippingAddress } = order;

  const { token, idempotencyKey, webhooks } = reqOptions;

  const orderOptions = get(order, [
    "integrationData",
    EASYNC_INTEGRATION_TYPE,
    "orderOptions"
  ]);
  const {
    shippingMethod,
    isGift,
    maxOrderPrice,
    clientNotes,
    isFBE
  } = orderOptions;

  const uri = "http://core.easync.io/api/v1/orders";

  let payload = {};

  if (idempotencyKey !== undefined) {
    payload["idempotency_key"] = idempotencyKey;
  }
  if (webhooks !== undefined) {
    payload["webhooks"] = buildWebhooksObj(webhooks);
  }
  if (retailer !== undefined) {
    payload["retailer"] = getRetailerCode(order);
  }
  if (orderProducts !== undefined) {
    payload["products"] = map(orderProducts, orderProduct =>
      buildOrderProductObj(order, orderProduct)
    );
  }
  if (shippingAddress !== undefined) {
    payload["shipping_address"] = buildAddressObj(shippingAddress);
  }
  if (shippingMethod !== undefined) {
    payload["shipping_method"] = shippingMethod;
  }
  if (paymentMethod !== undefined) {
    payload["payment_method"] = buildPaymentMethodObj(paymentMethod);
  }
  if (retailerCredentials !== undefined) {
    payload["retailer_credentials"] = buildRetailerCredentialObj(
      retailerCredentials
    );
  }
  if (isGift !== undefined) {
    payload["is_gift"] = isGift;
  }
  if (maxOrderPrice !== undefined) {
    payload["max_price"] = maxOrderPrice;
  }
  if (clientNotes !== undefined) {
    payload["client_notes"] = clientNotes;
  }
  if (isFBE !== undefined) {
    payload["fbe"] = isFBE;
  }

  const request = {
    headers: {
      Authorization: "Basic " + new Buffer(token + ":").toString("base64"),
      "Content-Type": "application/json"
    },
    payload
  };
  return { uri, request };
}
