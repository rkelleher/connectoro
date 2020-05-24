import cron from 'node-cron';
import _ from "lodash";
import Bluebird from "bluebird";
import Boom from "@hapi/boom";

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
    const account = await Account.findOne({
        integrations: {
            $elemMatch: {
                integrationType: LINNW_INTEGRATION_TYPE
            }
        }
    });
    
    if (!account) return;

    const integration = account.integrations.find(el => el.integrationType === LINNW_INTEGRATION_TYPE);

    const { appId, credentials, options, session } = integration;

    const appInstallToken = credentials && credentials.get("INSTALL_TOKEN");
    if (!appInstallToken) {
        throw Boom.badRequest("No Linnworks Install Token");
    }

    // TODO move somewhere else
    if (!session) {
        const appSecret = cg("LINNW_APP_SECRET");
        const linnworksSession = await makeLinnworksAPISession(
            appId,
            appSecret,
            appInstallToken
        );
        integration.session = linnworksSession;
        await account.save();
    }

    const sessionToken = integration.session.Token;
    const locationId =
        (options && options.defaultLocation) ||
        "00000000-0000-0000-0000-000000000000";
    const someOrders = await getLinnworksOpenOrdersPaged(
        sessionToken,
        locationId,
        15,
        1
    );

    let orderDocs = [];
    await Bluebird.each(someOrders.Data, async inputOrder => {
        const inputId = inputOrder["NumOrderId"];
        const existingOrder = await getOrderByLinworkId(inputId);

        if (existingOrder) return;

        const orderDoc = await convertLinnworksOrder(account, inputOrder);

        orderDocs.push(orderDoc);
    });


    if (orderDocs.length <= 0) return;

    createOrders(orderDocs);
}, {
    timezone: 'Europe/Kiev',
});
