import _ from "lodash";
import uuid from "uuid"
import { getEasyncOrderData, getEasyncSelectionCriteria, getEasyncExternalId } from "./easync.js";

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

const buildWebhooksObj = webhooks => ({
  "order_placed": webhooks.orderPlaced,
  "order_failed": webhooks.orderFailed,
  "tracking_obtained": webhooks.trackingObtained,
  "status_updated": webhooks.statusUpdated
});

const buildSellerSelectionCriteraObj = orderProduct => {
  const criteria = getEasyncSelectionCriteria(orderProduct);
  return {
    "condition_in": criteria.conditionIn,
    "handling_days_max": criteria.handlingDaysMax,
    "max_item_price": criteria.maxItemPrice,
    "prime": criteria.isPrime
  };
};

const buildOrderProductObj = orderProduct => ({
  "product_id": getEasyncExternalId(orderProduct),
  "quantity": orderProduct.quantity,
  "seller_selection_criteria": buildSellerSelectionCriteraObj(orderProduct)
});

const buildAddressObj = (address, countryCode) => ({
  "first_name": address.firstName,
  "last_name": address.lastName,
  "address_line1": address.addressLine1,
  "address_line2": address.addressLine2,
  "zip_code": address.zipCode,
  "city": address.city,
  "state": address.state,
  "country": countryCode,
  // TODO Germany-specific privacy laws?
  "phone_number": address.phoneNumber
});


export async function buildEasyncOrderPayload ({ order, idempotencyKey = uuid.v4(), webhooks }) {
    const { orderProducts, shippingAddress } = order;

    console.log('idempotencyKey', idempotencyKey);

    const {
      retailerCode,
      countryCode,
      shippingMethod,
      isGift,
      maxOrderPrice,
      clientNotes,
      isFBE
    } = getEasyncOrderData(order);

    let payload = {};

    payload["idempotency_key"] = idempotencyKey;

    payload["retailer"] = retailerCode;

    payload["products"] = _.map(orderProducts, orderProduct =>
        buildOrderProductObj(orderProduct, retailerCode)
    );

    payload["shipping_address"] = buildAddressObj(shippingAddress, countryCode);

    if (webhooks !== undefined) {
      payload["webhooks"] = buildWebhooksObj(webhooks);
    }

    if (shippingMethod !== undefined) {
      payload["shipping_method"] = shippingMethod;
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

    return payload;
  }

export async function buildEasyncOrderReq (payload, token) {
    const uri = "https://core.easync.io/api/v1/orders";

    const headers = {
      Authorization: "Basic " + new Buffer(token + ":").toString("base64"),
      "Content-Type": "application/json"
    };

    return {
      uri,
      headers,
      payload
    };
  }
