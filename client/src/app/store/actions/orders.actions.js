import _ from "lodash";
import axios from "axios";
import history from '@history';

export const GET_ORDERS = "[E-COMMERCE APP] GET ORDERS";
export const SET_ORDERS_SEARCH_TEXT = "[E-COMMERCE APP] SET ORDERS SEARCH TEXT";

export function getOrders() {
    const request = axios.get("/api/orders");
    const process = data => {
        return data;
        // _.map(data, order => ({
        //     id: order._id,
        //     date: _.get(order, ["inputOrder", "GeneralInfo", "ReceivedDate"]),
        //     numItems: _.get(order, ["inputOrder", "GeneralInfo", "NumItems"]),
        //     customerFullName: _.get(order, [
        //         "inputOrder",
        //         "CustomerInfo",
        //         "Address",
        //         "FullName"
        //     ]),
        //     inputOrder: order.inputOrder
        // }))
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
