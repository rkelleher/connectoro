import _ from "lodash";
import axios from "axios";
import history from '@history';

export const GET_ORDERS = "[ORDERS] GET ORDERS";

export function getOrders() {
    const request = axios.get("/api/orders");
    const process = data => {
        return data;
    };
    return dispatch =>
        request.then(response =>
            dispatch({
                type: GET_ORDERS,
                payload: process(response.data)
            })
        );
}

export function createOrder() {
    return async dispatch => {
        const { data } = await axios.post(`/api/orders`);
        if (data) {
            history.push({
                pathname: `/orders/${data._id}`
            });
        }
    };
}
