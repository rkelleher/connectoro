import _ from "lodash";
import history from '@history';
import axios from "axios";

export const GET_PRODUCTS = "[E-COMMERCE APP] GET PRODUCTS";

export function getProducts() {
    const request = axios.get("/api/products");
    const process = data => {
        return data;
    };
    return dispatch =>
        request.then(response =>
            dispatch({
                type: GET_PRODUCTS,
                payload: process(response.data)
            })
        );
}

export function createProduct() {
    return async dispatch => {
        const { data } = await axios.post(`/api/products`);
        if (data) {
            history.push({
                pathname: `/products/${data._id}`
            });
        }
    };
}
