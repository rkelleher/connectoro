import axios from "axios";
import React from "react";
import { DialogTitle, DialogContent } from "@material-ui/core";
import JSONPretty from "react-json-pretty";
import * as Actions from "app/store/actions";

export const GET_ORDER = "[ORDER] GET ORDER";
export const GOT_ORDER = "[ORDER] GOT ORDER";
export const SET_ORDER = "[ORDER] SET ORDER";
export const SAVING_ORDER = "[ORDER] SAVING";
export const SAVED_ORDER = "[ORDER] SAVED";

export const SAVING_ORDER_EASYNC_OPTS = "[ORDER] SAVING EASYNC ORDER OPTS";
export const SAVED_ORDER_EASYNC_OPTS = "[ORDER] SAVED EASYNC ORDER OPTS";

export const EDIT_ORDER_PRODUCT_QTY = "[ORDER] EDIT ORDER PROD QTY";
export const STOP_EDIT_ORDER_PRODUCT_QTY = "[ORDER] STOP EDIT ORDER PROD QTY";
export const SAVING_ORDER_PRODUCT_QTY = "[ORDER] SAVING ORDER PROD QTY";
export const SAVED_ORDER_PRODUCT_QTY = "[ORDER] SAVED ORDER PROD QTY";

export const REMOVING_ORDER_PRODUCT = "[ORDER] REMOVING ORDER PROD";
export const REMOVED_ORDER_PRODUCT = "[ORDER] REMOVED ORDER PROD";

export const ADDING_ORDER_PRODUCT = "[ORDER] ADDING ORDER PROD";
export const ADDED_ORDER_PRODUCT = "[ORDER] ADDED ORDER PROD";

export const SAVING_ORDER_PRODUCT_EASYNC = '[ORDER] SAVING ORDER PROD EASYNC';
export const SAVED_ORDER_PRODUCT_EASYNC = '[ORDER] SAVED ORDER PROD EASYNC';

export const GET_EASYNC_ORDER_STATUS = '[ORDER] GET_EASYNC_ORDER_STATUS';
export const GOT_EASYNC_ORDER_STATUS = '[ORDER] GOT_EASYNC_ORDER_STATUS';

export const  CHANGE_STATUS = 'CHANGE_STATUS';

export function getOrder({ orderId }) {
    const request = axios.get(`/api/orders/${orderId}`);
    const process = order => {
        return order;
    };
    return async dispatch => {
        dispatch({
            type: GET_ORDER
        });
        const response = await request;
        return dispatch({
            type: GOT_ORDER,
            payload: process(response.data)
        });
    };
}

export function addProductToOrder(orderId, productId) {
    return async dispatch => {
        dispatch({
            type: ADDING_ORDER_PRODUCT
        });
        const { data } = await axios.post(`/api/orders/${orderId}/products`, {
            productId
        });
        if (data) {
            dispatch({
                type: SET_ORDER,
                payload: data
            });
        }
        return dispatch({
            type: ADDED_ORDER_PRODUCT
        });
    };
}

export function removeProductFromOrder(orderId, orderProductId) {
    return async dispatch => {
        dispatch({
            type: REMOVING_ORDER_PRODUCT,
            payload: orderProductId
        });
        const { data } = await axios.delete(
            `/api/orders/${orderId}/products/${orderProductId}`
        );
        if (data) {
            dispatch({
                type: SET_ORDER,
                payload: data
            });
        }
        return dispatch({
            type: REMOVED_ORDER_PRODUCT,
            payload: orderProductId
        });
    };
}

export function saveOrderProductQuantity({quantity }, {orderId, orderProductId}) {
    return async dispatch => {
        dispatch({
            type: SAVING_ORDER_PRODUCT_QTY,
            payload: orderProductId
        });
        const changes = {
            "quantity": quantity
        };
        const { data } = await axios.patch(`/api/orders/${orderId}/products/${orderProductId}`, {
            changes
        });
        if (data) {
            dispatch({
                type: SET_ORDER,
                payload: data
            });
        }
        return dispatch({
            type: SAVED_ORDER_PRODUCT_QTY,
            payload: orderProductId
        });
    };
}

export function editOrderProductQuantity({orderProductId}) {
    return {
        type: EDIT_ORDER_PRODUCT_QTY,
        payload: orderProductId
    }
}

export function cancelEditOrderProductQuantity({orderProductId}) {
    return {
        type: STOP_EDIT_ORDER_PRODUCT_QTY,
        payload: orderProductId
    }
}

export function saveOrderProductEasyncSelectionCriteriaOptions(form, orderId, orderProductId) {
    return async dispatch => {
        dispatch({
            type: SAVING_ORDER_PRODUCT_EASYNC,
            payload: orderProductId
        });
        const changes = {
            "integrationData": {
                "EASYNC": {
                    "selectionCriteria": form
                }
            }
        };
        const { data } = await axios.patch(`/api/orders/${orderId}/products/${orderProductId}`, {
            changes
        });
        if (data) {
            dispatch({
                type: SET_ORDER,
                payload: data
            });
        }
        return dispatch({
            type: SAVED_ORDER_PRODUCT_EASYNC,
            payload: orderProductId
        });
    };
}


export function saveOrderEasyncOptions(form, orderId) {
    return async dispatch => {
        dispatch({
            type: SAVING_ORDER_EASYNC_OPTS
        });
        const changes = {
            "integrationData": {
                "EASYNC": form
            }
        };
        const { data } = await axios.patch(`/api/orders/${orderId}`, {
            changes
        });
        if (data) {
            dispatch({
                type: SET_ORDER,
                payload: data
            });
        }
        return dispatch({
            type: SAVED_ORDER_EASYNC_OPTS
        });
    };
}

export function DataDialog(data) {
    return (
        <>
            <DialogTitle>Data</DialogTitle>
            <DialogContent dividers>
                <JSONPretty id="json-pretty" data={data} />
            </DialogContent>
        </>
    );
}

export const changeStatus = (status) =>{
    return async dispatch =>{
        dispatch({
            type: CHANGE_STATUS,
            payload: status
        })
    }
}


export function testSendOrder(order) {
    return async dispatch => {
        dispatch({
            type: GET_EASYNC_ORDER_STATUS
        });

        const {data} = await axios.post(`/api/easync/order-test`, {
            orderId: order
        });
        if (data) {
            let payload;
            if(data.data.status){
                payload = data.data.status
            }else{
                const orderFile = await axios.get(`/api/orders/${order}`)
                payload = orderFile.data.easyncOrderStatus.status;
            }
            dispatch(
                {
                    type: GOT_EASYNC_ORDER_STATUS,
                    payload: payload
                }
            );
            dispatch(
                Actions.openDialog({
                    children: <DataDialog data={data}/>
                }),
            );
        }
    };
}

export function saveOrderCustomer(form, orderId) {
    return async dispatch => {
        dispatch({
            type: SAVING_ORDER
        });
        const changes = {
            "shippingAddress": form
        };
        const { data } = await axios.patch(`/api/orders/${orderId}`, {
            changes
        });
        if (data) {
            dispatch({
                type: SET_ORDER,
                payload: data
            });
        }
        return dispatch({
            type: SAVED_ORDER
        });
    };
}
