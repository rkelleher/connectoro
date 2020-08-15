import cron from 'node-cron';
import _ from "lodash";
const get = _.get;
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
import { Product } from '../models/product.model.js';
import { EASYNC_INTEGRATION_TYPE } from '../integrations/easync/easync.js';

export async function pullLinnworksProduct(product, account) {
  const dbProduct = await Product.findOne({ SKU: product.SKU });

  if (dbProduct) {
    return dbProduct;
  }

  const convertedProduct = IntegrationUtil.convertLinnworksProduct(product, account);
  convertedProduct.accountId = account._id;

  return Product.create(convertedProduct);
}

async function pullLinnworksOrder(order, account) {
  let dbOrder = await Order.findOne({
    'integrationData.LINNW.numOrderId': order.NumOrderId
  });

  if (!dbOrder) {
    const convertedOrder = IntegrationUtil.convertLinnworksOrder(order);
    convertedOrder.accountId = account._id;

    dbOrder = await Order.create(convertedOrder);
  }

  return Bluebird.each(order.Items, async product => {
    const dbProduct = await pullLinnworksProduct(product, account);
    console.log(dbProduct);

    dbOrder.orderProducts.push({
      productId: dbProduct._id,
      quantity: 1,
      integrationData: {
        [EASYNC_INTEGRATION_TYPE]: {
          selectionCriteria: get(product, [
            "integrationData",
            EASYNC_INTEGRATION_TYPE,
            "orderProductData",
            "selectionCriteria"
          ])
        }
      }
    });

    return dbOrder.save();
  });
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

  return Bluebird.each(orders.Data, async order => pullLinnworksOrder(order, account));
}

export const cronFetchFromLinworks = (cg) => cron.schedule('0 */30 * * * *',  async () => {
  const accounts = await AccountService.findByIntegrationType(LINNW_INTEGRATION_TYPE);

  if (!accounts.length) return;

  await Bluebird.each(accounts, async account => pullLinnworksOrdersByLocation(account, cg));
}, {
  timezone: 'Europe/Kiev',
});
