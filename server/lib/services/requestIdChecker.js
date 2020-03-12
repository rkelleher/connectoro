import { getAccount, getIntegrationByType, getIntegrationCredential } from "../controllers/account.controller.js";
import { EASYNC_INTEGRATION_TYPE, EASYNC_TOKEN_CREDENTIAL_KEY, EASYNC_ORDER_RESPONSE_CODES, EASYNC_ORDER_RESPONSE_TYPES } from "../integrations/easync/easync.js";

import cron from 'node-cron';
import { updateOrderById, getAllOrdersByStatus } from '../controllers/order.controller.js';
import { getStatusByRequestId } from '../integrations/easync/getEasyncOrdedStatus.js';

const job = cron.schedule('0 32 * * * *',  async () => {
    console.log("Cron job");

    // TODO: need to check method on next line
    const orders = await getAllOrdersByStatus(EASYNC_ORDER_RESPONSE_CODES.IN_PROCESSING);

    console.log('Orders count: ', orders.length);

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

        const data = await getStatusByRequestId(requestId, token);

        const { _type, code } = data;

        if (_type === EASYNC_ORDER_RESPONSE_TYPES.SUCCESS) {
            await updateOrderById(order._id, {
                status: EASYNC_ORDER_RESPONSE_TYPES.SUCCESS,
            })
        } else if (_type === EASYNC_ORDER_RESPONSE_TYPES.ERROR && code !== EASYNC_ORDER_RESPONSE_CODES.IN_PROCESSING) {
            await updateOrderById(order._id, {
                status: EASYNC_ORDER_RESPONSE_TYPES.ERROR,
            })
        }
    }

}, {
    timezone: 'Europe/Kiev',
});
job.start();
