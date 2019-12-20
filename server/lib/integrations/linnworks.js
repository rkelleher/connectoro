// https://help.linnworks.com/support/solutions/articles/7000007478-getopenorders-api-call-filter-samples
// https://help.linnworks.com/support/solutions/articles/7000007824-getallopenorders

import Wreck from '@hapi/wreck';
import querystring from 'querystring';

export const LINNW_INTEGRATION_TYPE = 'LINNW';

// NEXT
export function convertLinnworksOrder(accountId, inputId, inputOrder) {
  return {
    accountId,
    inputId,
    inputOrder,
    inputIntegrationType: LINNW_INTEGRATION_TYPE
  }
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
    const linnworksSession = JSON.parse(payload);
    return linnworksSession;
    
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
    const orderIds = JSON.parse(payload);
    return orderIds;
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
    const order = JSON.parse(payload);
    return order;
  } catch (error) {
    console.error(error);
  }
}
