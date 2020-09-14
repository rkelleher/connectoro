import axios from 'axios'

export async function getOrderTracking(requestId, token) {
  const uri = `https://core.easync.io/api/v1/tracking/${requestId}`;

  const headers = {
    Authorization: "Basic " + new Buffer(token + ":").toString("base64"),
    "Content-Type": "application/json"
  };

  const { data } = await axios({
    url: uri,
    method: 'GET',
    headers
  });

  return data;
}
