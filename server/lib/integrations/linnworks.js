// https://help.linnworks.com/support/solutions/articles/7000007478-getopenorders-api-call-filter-samples
// https://help.linnworks.com/support/solutions/articles/7000007824-getallopenorders

import Wreck from '@hapi/wreck';
import querystring from 'querystring';

export const LINNW_INTEGRATION_TYPE = 'LINNW';

async function authenticate(appID, appSecret, appInstallToken) {
  const uri = 'https://api.linnworks.net/api/Auth/AuthorizeByApplication';
  const {res, payload} = await Wreck.post(uri, {
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
}

function buildAppInstallURL(appID) {
  return `https://apps.linnworks.net/Authorization/Authorize/${appID}`
}

function normalizeAddress() {
  // 
}

async function getOpenOrders(token, locationId, options = {}) {
  // 
}

async function getOrderDetails(token, orderId, locationId, options = {}) {
  // 
}
