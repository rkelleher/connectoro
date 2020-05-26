import cron from 'node-cron';
import _ from "lodash";
import Bluebird from "bluebird";

import { Account } from "../models/account.model.js";
import {
  createOrders,
  getOrderByLinworkId
} from "../controllers/order.controller.js";
import {
  LINNW_INTEGRATION_TYPE,
  makeLinnworksAPISession,
  getLinnworksOpenOrdersPaged,
  convertLinnworksOrder
} from "../integrations/linnworks.js";

export const cronFetchFromLinworks = (cg) => cron.schedule('0 */30 * * * *',  async () => {
    const accounts = await Account.find({
        integrations: {
            $elemMatch: {
                integrationType: LINNW_INTEGRATION_TYPE
            }
        }
    });

    if (!accounts.length) return;

    let orderDocs = [];

    await Bluebird.each(accounts, async account => {
        const integration = account.integrations.find(el => 
            el.integrationType === LINNW_INTEGRATION_TYPE
        );

        if (!integration.session) {
            const linnworksSession = await makeLinnworksAPISession(
                integration.appId,
                cg("LINNW_APP_SECRET"),
                integration.credentials && integration.credentials.get("INSTALL_TOKEN")
            );
            integration.session = linnworksSession;
            await account.save();
        }

        const location = account.integrationData.LINNW.choosedLocation.StockLocationId 
            || '00000000-0000-0000-0000-000000000000';

        const someOrders = await getLinnworksOpenOrdersPaged(
            integration.session.Token,
            location,
            15,
            1
        );

        await Bluebird.each(someOrders.Data, async inputOrder => {
            const inputId = inputOrder["NumOrderId"];
            const existingOrder = await getOrderByLinworkId(inputId);

            if (existingOrder) return;

            const orderDoc = await convertLinnworksOrder(account, inputOrder);

            orderDocs.push(orderDoc);
        });
    });

    if (orderDocs.length <= 0) return;

    await createOrders(orderDocs);
}, {
    timezone: 'Europe/Kiev',
});
