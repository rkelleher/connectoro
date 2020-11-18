import axios from "axios";
import history from '@history';

export const GET_ORDERS = "[ORDERS] GET ORDERS";
export const GOT_ORDERS = "[ORDERS] GOT ORDERS";

export function getOrders(params) {
    let queryStr='';
    console.log(params);
    if (params) {
        if (params.rangeDate) {
            queryStr = `?rangeDate=${params.rangeDate}`
        }
        if (params.startDate) {
            queryStr = `?startDate=${params.startDate}&endDate=${params.endDate}`
        }
        if (params.search) {
            queryStr = `?search=${params.search}`
        }
        if (params.status) {
            queryStr = `?status=${params.status}`
        } 
        if (params.tracking) {
            queryStr = `?tracking=${params.tracking}`
        } 
    }
    const request = axios.get(`/api/orders${queryStr}`);
    const process = data => {
        return data;
    };
    return async dispatch => {
        dispatch({
            type: GET_ORDERS
        });
        const response = await request;
        return dispatch({
        type: GOT_ORDERS,
        payload: process(response.data)
        });
    }    
}

export function setSelector (selector, value) {
    let string = '';

    if (value !== 'all' && selector) {
        string = `?${selector}=${value}`
    } 
        
    const request = axios.get(`/api/orders${string}`);
    const process = data => {
        return data;
    };
    return async dispatch => {
        dispatch({
            type: GET_ORDERS
        });
        const response = await request;
        return dispatch({
        type: GOT_ORDERS,
        payload: process(response.data)
        });
    } 
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
