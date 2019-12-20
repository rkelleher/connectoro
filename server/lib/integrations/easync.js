import _ from 'lodash';

 // https://developer.easync.io/?javascript

export const EASYNC_INTEGRATION_TYPE = 'EASYNC';
export const EASYNC_TOKEN_CREDENTIAL_KEY = 'API_TOKEN';

const buildWebhooksObj = o => ({
  "order_placed": o.orderPlaced,
  "order_failed": o.orderFailed,
  "tracking_obtained": o.trackingObtained,
  "status_updated": o.statusUpdated
});

const buildPaymentMethodObj = o => ({
  "name_on_card": o.nameOnCard,
  "number": o.number,
  "security_code": o.securityCode,
  "expiration_month": o.expirationMonth,
  "expiration_year": o.expirationYear,
  "use_gift": o.useGift
});

const buildSellerSelectionCriteraObj = o => ({
  "addon": o.addon,
  "condition_in": o.conditionIn,
  "handling_days_max": o.handlingDaysMax,
  "max_item_price": o.maxItemPrice,
  "min_seller_num_ratings": o.minSellerNumRatings,
  "prime": o.prime,
});

const buildProductObj = o => ({
  "product_id": o.productId, // retailer's id
  "quantity": o.quantity,
  "seller_selection_criteria": buildSellerSelectionCriteraObj(o.sellerSelectionCriteria),
});

const buildAddressObj = o => ({
  "first_name": o.firstName,
  "last_name": o.lastName,
  "address_line1": o.addressLine1,
  "address_line2": o.addressLine2,
  "zip_code": o.zipCode,
  "city": o.city,
  "state": o.state,
  // http://www.theodora.com/country_digraphs.html
  "country": o.countryCode,
  "phone_number": o.phoneNumber,
});

const buildRetailerCredentialObj = o => ({
  "email": o.email,
  "password": o.password
});

// NEXT
export function buildEasyncOrderReq({
  retailer,
  products,
  shippingAddress,
  shippingMethod,
  billingAddress,
  paymentMethod,
  retailerCredentials,
  giftMessage,
  isGift,
  maxOrderPrice,
  clientNotes,
  isFBE,
}, {
  idempotencyKey,
  token,
  webhooks
}) {
  const uri = "http://core.easync.io/api/v1/orders";
  const request = {
      headers: {
        'Authorization': "Basic " + new Buffer(token + ":").toString("base64"),
        'Content-Type': 'application/json'
      },
      payload: {
        "idempotency_key": idempotencyKey,
        "webhooks": buildWebhooksObj(webhooks),

        "retailer": retailer,
        "products": _.map(products, buildProductObj),
        "shipping_address": buildAddressObj(shippingAddress),
        "shipping_method": shippingMethod,
        "billing_adress": buildAddressObj(billingAddress),
        "payment_method": buildPaymentMethodObj(paymentMethod),
        "retailer_credentials": buildRetailerCredentialObj(retailerCredentials),

        "gift_message": giftMessage,
        "is_gift": isGift,
        "max_price": maxOrderPrice,
        "client_notes": clientNotes,
        "fbe:": isFBE,
      }
    }
  return { uri, request };
}

