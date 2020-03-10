// import { CronJob } from 'cron'
import { getAccount, getIntegrationByType, getIntegrationCredential } from "../controllers/account.controller";
import { EASYNC_INTEGRATION_TYPE, EASYNC_TOKEN_CREDENTIAL_KEY, EASYNC_ORDER_STATUS } from "../integrations/easync/easync";

const cron = require('node-cron');
const { updateEasyncRequestId, updateEasyncRequestResult, getAllOrdersByStatus } = require('../controllers/order.controller');
const { getStatusByRequestId } = require('../integrations/easync/getEasyncOrdedStatus');

const job = cron.schedule('5 * * * * *', async function() {
    const orders = await getAllOrdersByStatus('processing');

    for (let order of orders) {
        const requestId = order.easyncRequestId;

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

        if (code === '')

    }

}, null, true, 'Europe/Kiev');
job.start();
