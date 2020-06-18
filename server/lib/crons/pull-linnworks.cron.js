import cron from 'node-cron';
import _ from "lodash";
import Bluebird from "bluebird";

import {
  LINNW_INTEGRATION_TYPE,
  makeLinnworksAPISession,
  getLinnworksOpenOrdersPaged,
  DEFAULT_LOCATION
} from "../integrations/linnworks.js";
import * as AccountService from "../services/account.service.js";
import * as IntegrationUtil from '../utils/integration.util.js';
import { Order } from '../models/order.model.js';

async function pullLinnworksOrder(order) {
  const dbOrder = await Order.findOne({ 
    'integrationData.LINNW.numOrderId': 390584
  });

  if (dbOrder) { return; }

  const convertedOrder = IntegrationUtil.convertLinnworksOrder(order);

  return Order.create(convertedOrder);
}

async function pullLinnworksOrdersByLocation(account, cg) {
  const integration = IntegrationUtil.getIntegrationByType(account, LINNW_INTEGRATION_TYPE);

  if (!integration.session) {
    const linnworksSession = await makeLinnworksAPISession(
      integration.appId,
      cg("LINNW_APP_SECRET"),
      integration.credentials && integration.credentials.get("INSTALL_TOKEN")
    );

    integration.session = linnworksSession;
    await account.save();
  }

  const location = 
    account.integrationData.LINNW.choosedLocation.StockLocationId ||
    DEFAULT_LOCATION.StockLocationId;

  const orders = await getLinnworksOpenOrdersPaged(
    integration.session.Token,
    location,
    15,
    1
  );
     
  return Bluebird.each(orders.Data, async order => pullLinnworksOrder(order));
}

export const cronFetchFromLinworks = (cg) => cron.schedule('0 */30 * * * *',  async () => {
  const accounts = await AccountService.findByIntegrationType(LINNW_INTEGRATION_TYPE);

  if (!accounts.length) return;

  await Bluebird.each(accounts, async account => pullLinnworksOrdersByLocation(account, cg));
}, {
    timezone: 'Europe/Kiev',
});
