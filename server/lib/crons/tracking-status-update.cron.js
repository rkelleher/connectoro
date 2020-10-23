import cron from 'node-cron';

import { getAccount, getIntegrationByType, getIntegrationCredential } from '../controllers/account.controller.js';
import { getAllOrdersWithTracker } from '../controllers/order.controller.js';
import { EASYNC_INTEGRATION_TYPE, EASYNC_TOKEN_CREDENTIAL_KEY, EASYNC_TRACKING_RESPONSE_TRACKER_PROGRESS_STATUS, EASYNC_TRACKING_RESPONSE_TYPES } from "../integrations/easync/easync.js";
import { getTrackingByRequestId } from "../integrations/easync/getEasyncOrdedStatus.js";
import { LINNW_INTEGRATION_TYPE, markLinnworkOrderAsProcessed, sendTrackingNumberToLinnw, makeLinnworksAPISession } from '../integrations/linnworks.js';
import { Log } from '../models/logs.model.js';
import * as IntegrationUtil from '../utils/integration.util.js';

export const TrackingUpdateStatusCron = (cg) => cron.schedule('0 0 */4 * * *',  async () => {
  console.log('-------------------------');
  console.log("Cron tracking UPDATE status job");
  console.log('-------------------------');
  await Log.create({log: 'Tracking update cron'});

  const orders = await getAllOrdersWithTracker();

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

      if (request.result.status === EASYNC_TRACKING_RESPONSE_TRACKER_PROGRESS_STATUS.SHIPPING) {
        if (order.easyncTracking.status === request.result.status) {
          continue;
        }
        order.easyncTracking.status = request.result.status;
      }

      if (request.result.status === EASYNC_TRACKING_RESPONSE_TRACKER_PROGRESS_STATUS.DELIVERED) {
        order.easyncTracking.status = request.result.status;
      }

      if (request.result.status === EASYNC_TRACKING_RESPONSE_TRACKER_PROGRESS_STATUS.ERROR) {
        order.easyncTracking.status = request.result.status;
        order.easyncTracking.message = request.result.message;
      }

      await order.save();
    } catch (error) {}
  }
}, {
  timezone: 'Europe/Kiev',
});
