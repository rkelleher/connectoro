import axios from 'axios'

export async function getStatusByRequestId(requestId, token) {
    const uri = `https://core.easync.io/api/v1/orders/${requestId}`;

    const headers = {
        Authorization: "Basic " + Buffer.from(token + ":").toString("base64"),
        "Content-Type": "application/json"
    };

    const { data } = await axios({
        url: uri,
        method: 'GET',
        headers,
    });

    return data;
}

export async function getTrackingByRequestId(requestId, token) {
    const uri = `https://core.easync.io/api/v1/tracking/${requestId}`;

    const headers = {
        Authorization: "Basic " + Buffer.from(token + ":").toString("base64"),
        "Content-Type": "application/json"
    };

    const { data } = await axios({
        url: uri,
        method: 'GET',
        headers,
    });
    
    return data;
}

