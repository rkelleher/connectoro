{
  "order": {
    "_id": "5f68d50905142d000bc5ada4",
    "easyncOrderStatus": {
      "status": "awaiting_tracker",
      "requestId": "9809ec60-fc28-11ea-a47c-176c9131b339",
      "idempotencyKey": "fa9af0ae-2523-4f88-8d29-2504a47b9888",
      "message": "Request is currently processing and will complete soon.",
      "request": {
        "_type": "order_response",
        "merchant_order_ids": [
          {
            "merchant_order_id": "205-1075686-0901165",
            "merchant": null,
            "account": "FBE",
            "placed_at": "2020-09-21T16:43:28.000Z"
          }
        ],
        "price_components": {
          "shipping": 0,
          "subtotal": 999,
          "tax": 0,
          "total": 999,
          "gift_certificate": 0,
          "discount": null
        },
        "tracking_url": "https://www.amazon.co.uk/progress-tracker/package/ref=ppx_od_dt_b_track_package?_encoding=UTF8&itemId=jlqhnvhmsjrtoo&orderId=205-1075686-0901165&vt=ORDER_DETAILS",
        "tracking": [
          {
            "carrier": "Amazon",
            "tracking_number": "QA0655709916",
            "product_id": "B00O1765VQ",
            "merchant_order_id": "205-1075686-0901165",
            "obtained_at": "2020-09-21T22:10:51.000Z",
            "tracking_url": "https://www.amazon.co.uk/progress-tracker/package/ref=ppx_od_dt_b_track_package?_encoding=UTF8&itemId=jlqhnvhmsjrtoo&orderId=205-1075686-0901165&vt=ORDER_DETAILS"
          }
        ],
        "request": {
          "idempotency_key": "fa9af0ae-2523-4f88-8d29-2504a47b9888",
          "retailer": "amazon_uk",
          "products": [
            {
              "product_id": "B00O1765VQ",
              "quantity": 1,
              "seller_selection_criteria": {
                "condition_in": [
                  "New"
                ],
                "handling_days_max": 4,
                "max_item_price": 1299,
                "prime": true
              }
            }
          ],
          "shipping_address": {
            "first_name": "Susan Wood",
            "last_name": "",
            "address_line1": "69 pugneys Road",
            "address_line2": "",
            "zip_code": "WF2 7JT",
            "city": "Wakefield",
            "state": "West Yorkshire",
            "country": "GB",
            "phone_number": "07759388198"
          },
          "webhooks": {
            "order_placed": "https://stage.connectoro.io/api/webhooks/order_placed",
            "order_failed": "https://stage.connectoro.io/api/webhooks/order_failed",
            "tracking_obtained": "https://stage.connectoro.io/api/webhooks/tracking_obtained",
            "status_updated": "https://stage.connectoro.io/api/webhooks/status_updated"
          },
          "shipping_method": "free",
          "is_gift": true,
          "max_price": 1299,
          "fbe": true
        },
        "request_id": "9809ec60-fc28-11ea-a47c-176c9131b339"
      },
      "tracking": {
        "type": "success",
        "request_id": "9809ec60-fc28-11ea-a47c-176c9131b339",
        "result": {
          "status": "shipping",
          "tracking": {}
        }
      }
    },
    "integrationData": {
      "EASYNC": {
        "retailerCode": "amazon_uk",
        "shippingMethod": "free",
        "countryCode": "GB",
        "isGift": true,
        "isFBE": true,
        "maxOrderPrice": 1299
      },
      "LINNW": {
        "numOrderId": 400709,
        "status": 1
      }
    },
    "shippingAddress": {
      "firstName": "Susan Wood",
      "lastName": "",
      "addressLine1": "69 pugneys Road",
      "addressLine2": "",
      "addressLine3": "",
      "zipCode": "WF2 7JT",
      "city": "Wakefield",
      "state": "West Yorkshire",
      "countryName": "United Kingdom",
      "phoneNumber": "07759388198",
      "_id": "5f68d50905142d000bc5ada5"
    },
    "accountId": "5dfaf5a8deec9a000702d474",
    "orderProducts": [
      {
        "integrationData": {
          "EASYNC": {
            "selectionCriteria": {
              "conditionIn": [
                "New"
              ],
              "handlingDaysMax": 4,
              "maxItemPrice": 1299,
              "isPrime": true
            },
            "externalId": "B00O1765VQ"
          }
        },
        "quantity": 1,
        "_id": "5f68d50905142d000bc5ada6",
        "productId": "5e3c1ea3fbb9a800078f63d9",
        "product": {
          "_id": "5e3c1ea3fbb9a800078f63d9",
          "integrationData": {
            "EASYNC": {
              "orderProductData": {
                "selectionCriteria": {
                  "conditionIn": [
                    "New"
                  ],
                  "handlingDaysMax": 4,
                  "maxItemPrice": 1299,
                  "isPrime": true
                }
              }
            }
          },
          "title": "VS1 1-Port UK Charger New",
          "accountId": "5dfaf5a8deec9a000702d474",
          "createdDate": "2020-02-06T14:11:47.366Z",
          "externalIds": {
            "amazon_uk": "B00O1765VQ"
          },
          "__v": 0,
          "SKU": "10210"
        }
      }
    ],
    "createdDate": "2020-09-21T16:30:01.065Z",
    "__v": 0
  }
}


это гавнокод

order.request && order.request.price 

если будет выводить false, то попробуйешь order.request ? order.request.price : null

по поводу order source

спотри есть ли Linnw в integrationData

если да то Linnworks

в ином случае возвращай Manually

да, и постав там коменты что когда система розширеться до нескольких, то поменять логику