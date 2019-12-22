import axios from "axios";

export const GET_ORDER = "[ORDER] GET ORDER";
export const GOT_ORDER = "[ORDER] GOT ORDER";

export function getOrder({orderId}) {
    const request = axios.get(`/api/orders/${orderId}`);
    const process = order => {
        console.log(order)
        return order;
    };
    return async dispatch => {
        dispatch({
            type: GET_ORDER,
        });
        const response = await request;
        return dispatch({
            type: GOT_ORDER,
            payload: process(response.data)
        });
    }
}
