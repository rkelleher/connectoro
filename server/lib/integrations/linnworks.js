// https://help.linnworks.com/support/solutions/articles/7000007478-getopenorders-api-call-filter-samples
// https://help.linnworks.com/support/solutions/articles/7000007824-getallopenorders

import Wreck from '@hapi/wreck';
import querystring from 'querystring';
import Bluebird from "bluebird";
import unirest from "unirest";
import { Product } from '../models/product.model.js';

export const LINNW_INTEGRATION_TYPE = 'LINNW';

export const DEFAULT_LOCATION = {
  StockLocationId: '00000000-0000-0000-0000-000000000000',
  LocationName: 'Default'
};

export const linnwOrderDataShape = {
  numOrderId: {
    type: Number
  },
  status: {
    type: Number
  },
  source: {
    type: String
  },
  subSource: {
    type: String
  },
  orderId: {
    type: String
  }
};

export async function convertLinnworksOrder(account, inputOrder) {
  // const integration = account.integrations.find(el => el.integrationType === LINNW_INTEGRATION_TYPE);

  const linwOrder = {
    accountId: account.id,
    linwId: String(inputOrder.NumOrderId),
    shippingAddress: {
      addressLine1: inputOrder.CustomerInfo.Address.Address1,
      addressLine2: inputOrder.CustomerInfo.Address.Address2,
      addressLine3: inputOrder.CustomerInfo.Address.Address3,
      zipCode: inputOrder.CustomerInfo.Address.PostCode,
      city: inputOrder.CustomerInfo.Address.Town,
      state: inputOrder.CustomerInfo.Address.Region,
      countryName: inputOrder.CustomerInfo.Address.Country,
      phoneNumber: inputOrder.CustomerInfo.Address.PhoneNumber
    },
    orderStatus: String(inputOrder.GeneralInfo.Status),
    // integrationData: {
    //   LINNW_INTEGRATION_TYPE: integration
    // }
  };

  const clientName = inputOrder.CustomerInfo.Address.FullName;
  if (clientName.indexOf(' ') > -1) {
    const separator = clientName.indexOf(' ');
    linwOrder.shippingAddress.firstName = clientName.substr(0, separator); 
    linwOrder.shippingAddress.lastName = clientName.substr(separator); 
  } else if (clientName) {
    linwOrder.shippingAddress.firstName = clientName;
  }
  
  linwOrder.products = [];
  await Bluebird.each(inputOrder.Items, async product => {
    const isProductExist = await Product.findOne({ SKU: product.SKU });
    if (isProductExist) return;

    const dbProduct = await Product.create({
      accountId: account._id,
      SKU: product.SKU,
      title: product.Title,
      description: product.ChannelTitle,
      // integrationData: {
      //   LINNW_INTEGRATION_TYPE: integration
      // }
    });

    linwOrder.products.push({
      productId: dbProduct.id,
      quantity: product.Quantity,
      // integrationData: {
      //   LINNW_INTEGRATION_TYPE: integration
      // }
    });
  }) || [];

  return linwOrder;
}

// returns: https://apps.linnworks.net/Api/Class/API_Core-Modules-Sessions-Base-BaseSession
export async function makeLinnworksAPISession(appID, appSecret, appInstallToken) {
  const uri = 'https://api.linnworks.net/api/Auth/AuthorizeByApplication';
  try {
    const {payload} = await Wreck.post(uri, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      payload: querystring.stringify({
        ApplicationId: appID,
        ApplicationSecret: appSecret,
        Token: appInstallToken
      })
    });
    return JSON.parse(payload);
  } catch (error) {
    console.error(error);
  }
}

// https://apps.linnworks.net/Api/Method/Orders-GetOpenOrders
export async function getLinnworksOpenOrdersPaged(token, locationId, entriesNum, pageNum) {
  const uri = " https://eu-ext.linnworks.net//api/Orders/GetOpenOrders";
  const request = {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      payload: querystring.stringify({
        "fulfilmentCenter": locationId,
        "entriesPerPage": entriesNum,
        "pageNumber": pageNum
      })
    }
  try {
    const { payload } = await Wreck.post(uri, request);
    return JSON.parse(payload);
  } catch (error) {
    console.error(error);
  }
}

export async function getLinnworksOrderDetails(token, locationId, orderId) {
  const uri = "https://eu-ext.linnworks.net/api/Orders/GetOrder";
  const request = {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      payload: querystring.stringify({
        "orderid": orderId,
        "fulfilmentLocationId": locationId,
        "loadItems": true,
        "loadAdditionalInfo": true,
      })
    }
  try {
    const { payload } = await Wreck.post(uri, request);
    return JSON.parse(payload);
  } catch (error) {
    console.error(error);
  }
}

export async function getLinnworksLocations(token) {
  const uri = 'https://eu-ext.linnworks.net//api/Inventory/GetStockLocations';
  const request = {
    headers: {
      'Authorization': token,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  try {
    const { payload } = await Wreck.post(uri, request);
    return JSON.parse(payload);
  } catch (error) {
    console.error(error);
  }
}

export async function markLinnworkOrderAsProcessed(token, orderId) {
  const uri = 'https://eu-ext.linnworks.net//api/Orders/ProcessFulfilmentCentreOrder';

  const request = {
    headers: {
      'Authorization': token,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    payload: querystring.stringify({ orderId })
  };

  try {
    const { payload } = await Wreck.post(uri, request);
    return JSON.parse(payload);
  } catch (error) {
    console.error(error);
  }
}

export async function sendTrackingNumberToLinnw(token, orderId, TrackingNumber) {
  return new Promise((resolve, reject) => {
    unirest('POST', 'https://eu-ext.linnworks.net//api/Orders/SetOrderShippingInfo')
      .headers({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': token
      })
      .send(`orderId=${orderId}`)
      .send(`info={"TrackingNumber": "${TrackingNumber}"}`)
      .end(function (res) { 
        if (res.error) {
          reject(res.error);
        } else {
          resolve(JSON.parse(res.raw_body));
        }
      });
  });
}

export async function setLinnworksOrderNote(token, orderId, note) {
  return new Promise((resolve, reject) => {
    unirest('POST', 'https://eu-ext.linnworks.net//api/Orders/SetOrderNotes')
      .headers({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': token
      })
      .send(`orderId=${orderId}`)
      .send(`orderNotes=[{"OrderId": "${orderId}", "Note": "${note}"}]`)
      .end(function (res) { 
        if (res.error) {
          reject(res.error);
        } else {
          resolve(true);
        }
      });
  });
}
