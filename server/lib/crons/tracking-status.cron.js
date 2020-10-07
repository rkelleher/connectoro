import cron from 'node-cron';

import { getAccount, getIntegrationByType, getIntegrationCredential } from '../controllers/account.controller.js';
import { getAwaitingTrackerOrders } from '../controllers/order.controller.js';
import { EASYNC_INTEGRATION_TYPE,  EASYNC_TOKEN_CREDENTIAL_KEY, EASYNC_TRACKING_RESPONSE_TYPES } from "../integrations/easync/easync.js";
import { getTrackingByRequestId } from "../integrations/easync/getEasyncOrdedStatus.js";

export const TrackingStatusCron = cron.schedule('0 */90 * * * *',  async () => {
  console.log('-------------------------');
  console.log("Cron tracking status job");
  console.log('-------------------------');

  const orders = await getAwaitingTrackerOrders();

  for (const order of orders) {
    const { requestId } = order.easyncOrderStatus;

    if (!requestId) { 
      continue; 
    };

    const account = await getAccount(order.accountId);
    const integration = await getIntegrationByType(
      account,
      EASYNC_INTEGRATION_TYPE
    );
    const token = getIntegrationCredential(
      integration,
      EASYNC_TOKEN_CREDENTIAL_KEY
    );

    const request = await getTrackingByRequestId(requestId, token);

    if (request.type === EASYNC_TRACKING_RESPONSE_TYPES.SUCCESS) {
      order.easyncTracking.isObtained = true;
      order.easyncTracking.status = request.result.status;
      order.easyncTracking.trackingNumber = request.result.tracking.aquiline;
      await order.save();
    }
  }
}, {
  timezone: 'Europe/Kiev',
});
