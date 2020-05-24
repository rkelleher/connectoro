// https://help.linnworks.com/support/solutions/articles/7000007478-getopenorders-api-call-filter-samples
// https://help.linnworks.com/support/solutions/articles/7000007824-getallopenorders

import Wreck from '@hapi/wreck';
import querystring from 'querystring';
import Bluebird from "bluebird";
import { Product } from '../models/product.model.js';

export const LINNW_INTEGRATION_TYPE = 'LINNW';

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
  
  const products = await Bluebird.filter(inputOrder.Items, async product => {
    return !(await Product.findOne({SKU: product.SKU}));
  });

  linwOrder.products = await Bluebird.map(products, async product => {
    const dbProduct = await Product.create({
      accountId: account._id,
      SKU: product.SKU,
      title: product.Title,
      description: product.ChannelTitle,
      // integrationData: {
      //   LINNW_INTEGRATION_TYPE: integration
      // }
    });

    return {
      productId: dbProduct.id,
      quantity: product.Quantity,
      // integrationData: {
      //   LINNW_INTEGRATION_TYPE: integration
      // }
    }
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
