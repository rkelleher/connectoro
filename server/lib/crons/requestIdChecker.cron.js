import cron from 'node-cron';
import Bluebird from 'bluebird';

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
import * as IntegrationUtil from '../utils/integration.util.js';
import { updateOrderById, getAllOrdersByStatus } from '../controllers/order.controller.js';
import { getStatusByRequestId } from '../integrations/easync/getEasyncOrdedStatus.js';
import { setLinnworksOrderNote } from '../integrations/linnworks.js';
import { LINNW_INTEGRATION_TYPE } from '../models/product.model.js';

export default cron.schedule('0 */10 * * * *',  async () => {
    console.log("Cron job");

    const orders = await getAllOrdersByStatus([
        EASYNC_ORDER_STATUSES.PROCESSING,
        EASYNC_ORDER_STATUSES.AWAITING_TRACKER
    ]);

    await Bluebird.map(orders, async order => {
        const { requestId = null } = order.easyncOrderStatus;

        if (!requestId) { return; };

        const account = await getAccount(order.accountId);
        const integration = await getIntegrationByType(
            account,
            EASYNC_INTEGRATION_TYPE
        );
        const token = getIntegrationCredential(
            integration,
            EASYNC_TOKEN_CREDENTIAL_KEY
        );

        const request = await getStatusByRequestId(requestId, token);

        const newValue = {
            ...mapEasyncStatus(request)
        };

        if (
            order.easyncOrderStatus.status === EASYNC_ORDER_STATUSES.PROCESSING && 
            newValue.status === EASYNC_ORDER_STATUSES.AWAITING_TRACKER
        ) {
            const { orderId } = order['integrationData'][LINNW_INTEGRATION_TYPE];

            if (orderId) {
                return;
            }

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

            setLinnworksOrderNote(
                integration.session.Token,
                orderId,
                requestId
            );
        }

        await updateOrderById(order._id, newValue);
    });
}, {
    timezone: 'Europe/Kiev',
});
