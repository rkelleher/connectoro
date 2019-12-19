import _ from "lodash";
import axios from "axios";

export const GET_ORDERS = "[E-COMMERCE APP] GET ORDERS";
export const SET_ORDERS_SEARCH_TEXT = "[E-COMMERCE APP] SET ORDERS SEARCH TEXT";

export function getOrders() {
    const request = axios.get("/api/linnworks-orders");
    const process = data => {
        // TODO temporary code, until we get native orders
        const linnworksOpenOrders = _.get(data, ["raw", "Data"]);
        return _.map(linnworksOpenOrders, order => ({
            linnworksOrder: order,
            id: _.get(order, "NumOrderId"),
            date: _.get(order, ["GeneralInfo", "ReceivedDate"]),
            numItems: _.get(order, ["GeneralInfo", "NumItems"]),
            customerFullName: _.get(order, [
                "CustomerInfo",
                "Address",
                "FullName"
            ])
        }));
    };
    return dispatch =>
        request.then(response =>
            dispatch({
                type: GET_ORDERS,
                payload: process(response.data)
            })
        );
}
