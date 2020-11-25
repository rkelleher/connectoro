import axios from "axios";
import history from '@history';
import qs from 'qs';

export const GET_ORDERS = "[ORDERS] GET ORDERS";
export const GOT_ORDERS = "[ORDERS] GOT ORDERS";
export const SET_STATUS_ORDER = "[ORDERS] SET STATUS ORDER";
export const SET_TRACKING_ORDER = "[ORDERS] SET_TRACKING ORDER";
export const SET_DIRECTION = "[ORDERS] SET_DIRECTION ORDER";
export const SET_PAGE = "[ORDERS] SET_PAGE ORDER";
export const SET_ROWS_PER_PAGE = "[ORDERS] ROWS_PER_PAGE ORDER";
export const SAVE_PARAMS = "[ORDERS] SAVE_PARAMS ORDER";


export function getOrders(params) {
    let result = {};
    Object.keys(params).forEach((key) => { if ((params[key])) result[key] = params[key]; })
    const request = axios.get('/api/orders', {
        params: {
        ...result
    },
    paramsSerializer: (params) => {
        return qs.stringify(params, { arrayFormat: 'repeat' })
      },
    });
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

export function setFilter (field,value) {
    return dispatch => {
        if (field === 'status') {
            return dispatch({
                type: SET_STATUS_ORDER,
                payload: value, 
            })
        } else 
        if (field === 'tracking') {
            return dispatch({
                type: SET_TRACKING_ORDER,
                payload: value, 
            })
        }
    }
}

export function setDirection (direction) {
    return dispatch => {
        return dispatch({
            type: SET_DIRECTION,
            payload: direction,
        })
    }
}

export function setPageNumber(number) {
    return dispatch => {
        return dispatch({
            type: SET_PAGE,
            payload: number,
        })
    }
}

export function setRowsOnPage(number) {
    return dispatch => {
        return dispatch({
            type: SET_ROWS_PER_PAGE,
            payload: number,
        })
    }
}

export function saveParams(params) {
    return dispatch => {
        return dispatch({
            type: SAVE_PARAMS,
            payload: params,
        })
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
