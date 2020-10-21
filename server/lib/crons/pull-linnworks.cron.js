import cron from 'node-cron';
import _ from "lodash";
import Bluebird from "bluebird";

import {
  LINNW_INTEGRATION_TYPE,
  makeLinnworksAPISession,
  getLinnworksOpenOrdersPaged,
  DEFAULT_LOCATION
} from "../integrations/linnworks.js";
import { EASYNC_INTEGRATION_TYPE } from '../integrations/easync/easync.js';
import * as AccountService from "../services/account.service.js";
import * as IntegrationUtil from '../utils/integration.util.js';
import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { Log } from '../models/logs.model.js';

async function pullLinnworksOrder(order, account) {
  const isOrderExists = await Order.findOne({
    'integrationData.LINNW.numOrderId': order.NumOrderId
  });

  // UPDATE ORDER
  if (!!isOrderExists) {
    for (const product of order.Items || []) {
      const dbProduct = await Product.findOne({ SKU: product.SKU });

      if (!dbProduct) {
        continue;
      }

      if (
        isOrderExists.orderProducts.find(p => dbProduct._id.equals(p.productId))
      ) { continue; }

      isOrderExists.orderProducts.push({
        productId: dbProduct._id,
        quantity: product.Quantity,
        integrationData: {
          [EASYNC_INTEGRATION_TYPE]: {
            selectionCriteria: dbProduct.integrationData[EASYNC_INTEGRATION_TYPE].orderProductData.selectionCriteria
          }
        }
      });

      await isOrderExists.save();
    }

    return;
  }

  // CREATE NEW ORDER
  const convertedOrder = IntegrationUtil.convertLinnworksOrder(order);
  convertedOrder.accountId = account._id;

  const products = [];

  for (const product of order.Items || []) {
    const dbProduct = await Product.findOne({ SKU: product.SKU });

    if (!dbProduct) {
      continue;
    }

    products.push({
      productId: dbProduct._id,
      quantity: product.Quantity,
      integrationData: {
        [EASYNC_INTEGRATION_TYPE]: {
          selectionCriteria: dbProduct.integrationData[EASYNC_INTEGRATION_TYPE].orderProductData.selectionCriteria
        }
      }
    });
  }

  convertedOrder.orderProducts = products;

  await Order.create(convertedOrder);
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
  await Log.create({log: 'Pull-linnworks'});

  await Bluebird.each(accounts, async account => pullLinnworksOrdersByLocation(account, cg));
}, {
  timezone: 'Europe/Kiev',
});
