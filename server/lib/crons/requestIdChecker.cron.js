import cron from 'node-cron';

import { 
    getAccount, 
    getIntegrationByType, 
    getIntegrationCredential 
} from "../controllers/account.controller.js";
import { 
    EASYNC_INTEGRATION_TYPE, 
    EASYNC_TOKEN_CREDENTIAL_KEY, 
    EASYNC_ORDER_STATUSES, 
    mapEasyncStatus
} from "../integrations/easync/easync.js";
import { updateOrderById, getAllOrdersByStatus } from '../controllers/order.controller.js';
import { getStatusByRequestId, getTrackingByRequestId } from '../integrations/easync/getEasyncOrdedStatus.js';

export default cron.schedule('0 */10 * * * *',  async () => {
    console.log("Cron job");

    const orders = await getAllOrdersByStatus([
        EASYNC_ORDER_STATUSES.PROCESSING,
        EASYNC_ORDER_STATUSES.AWAITING_TRACKER
    ]);

    for (let order of orders) {
        const { requestId = null } = order.easyncOrderStatus;

        if (!requestId) break;

        const account = await getAccount(order.accountId);
        const integration = await getIntegrationByType(
            account,
            EASYNC_INTEGRATION_TYPE
        );

        const token = getIntegrationCredential(
            integration,
            EASYNC_TOKEN_CREDENTIAL_KEY
        );

        const request = await getStatusByRequestId(requestId, token)

        let tracking;
        if (order.easyncOrderStatus.status === EASYNC_ORDER_STATUSES.AWAITING_TRACKER)
            tracking = await getTrackingByRequestId(requestId, token);

        const newValue = {...mapEasyncStatus(request, tracking)};

        await updateOrderById(order._id, newValue);
    }

}, {
    timezone: 'Europe/Kiev',
});
