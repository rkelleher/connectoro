import cron from 'node-cron';

import { getAccount, getIntegrationByType, getIntegrationCredential } from '../controllers/account.controller.js';
import { getAwaitingTrackerOrders } from '../controllers/order.controller.js';
import { EASYNC_INTEGRATION_TYPE,  EASYNC_TOKEN_CREDENTIAL_KEY, EASYNC_TRACKING_RESPONSE_TYPES } from "../integrations/easync/easync.js";
import { getTrackingByRequestId } from "../integrations/easync/getEasyncOrdedStatus.js";
import { LINNW_INTEGRATION_TYPE, markLinnworkOrderAsProcessed, sendTrackingNumberToLinnw, makeLinnworksAPISession } from '../integrations/linnworks.js';
import * as IntegrationUtil from '../utils/integration.util.js';

export const TrackingStatusCron = (cg) => cron.schedule('0 */30 * * * *',  async () => {
  console.log('-------------------------');
  console.log("Cron tracking status job");
  console.log('-------------------------');

  const orders = await getAwaitingTrackerOrders();

  for (const order of orders) {
    try {
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

      if (request.type !== EASYNC_TRACKING_RESPONSE_TYPES.SUCCESS) {
        continue;
      }

      order.easyncTracking.isObtained = true;
      order.easyncTracking.status = request.result.status;
      order.easyncTracking.trackingNumber = request.result.tracking.aquiline;

      const { orderId } = order.integrationData[LINNW_INTEGRATION_TYPE];

      if (!orderId) {
        await order.save();
        continue;
      }

      const linnwIntegration = IntegrationUtil.getIntegrationByType(account, LINNW_INTEGRATION_TYPE);
      
      if (!linnwIntegration .session) {
        const linnworksSession = await makeLinnworksAPISession(
          linnwIntegration.appId,
          cg("LINNW_APP_SECRET"),
          linnwIntegration.credentials && linnwIntegration.credentials.get("INSTALL_TOKEN")
        );

        linnwIntegration.session = linnworksSession;
        await account.save();
      }
        
      await sendTrackingNumberToLinnw(
        linnwIntegration.session.Token,
        orderId,
        request.result.tracking.aquiline
      );

      const res = await markLinnworkOrderAsProcessed(
        linnwIntegration.session.Token,
        orderId
      );

      if (!res) {
        continue;
      }

      order.easyncTracking.processedOnSource = res.Processed;
      await order.save();
    } catch (error) {}
  }
}, {
  timezone: 'Europe/Kiev',
});
