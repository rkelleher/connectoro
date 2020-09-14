import { Account } from "../models/account.model.js";
import { Order } from "../models/order.model.js";
import { EASYNC_INTEGRATION_TYPE, EASYNC_TOKEN_CREDENTIAL_KEY } from "../integrations/easync/easync.js";
import { getOrderTracking } from "../integrations/easync/easync-requests.js";
import { getIntegrationByType, getIntegrationCredential } from "../controllers/account.controller.js";
import Bluebird from "bluebird";


export const cronDeliveryStatus = () => cron.schedule('0 */20 * * * *',  async () => {
  try {
    const accounts = await Account.find();

    for (const account of accounts) {
      const orders = await Order.find({ accountId: account._id });

      const token = getIntegrationCredential(
        getIntegrationByType(account, EASYNC_INTEGRATION_TYPE),
        EASYNC_TOKEN_CREDENTIAL_KEY
      );

      await Bluebird.each(orders, async order => {
        const { requestId = null } = order.easyncOrderStatus;

        if (!requestId) { return; }

        const data = await getOrderTracking(requestId, token);

        await Order.updateOne(
          { _id: order._id },
          { 
            $set: { 
              easyncOrderDeliveryStatus: {
                status: data.result.status,
                tracking: data.result.tracking.tracker_progress
              } 
            }
          }
        );

      });
    }
  } catch (error) {}
}, {
  timezone: 'Europe/Kiev',
});
