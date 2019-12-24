import axios from "axios";
import React, { useState } from "react";
import {
    DialogTitle,
    DialogContent,
} from "@material-ui/core";
import JSONPretty from "react-json-pretty";
import * as Actions from "app/store/actions";

export const GET_ORDER = "[ORDER] GET ORDER";
export const GOT_ORDER = "[ORDER] GOT ORDER";
export const SET_ORDER = "[ORDER] SET ORDER";
export const SAVING_ORDER = "[ORDER] SAVING";
export const SAVED_ORDER = "[ORDER] SAVED";
export const SAVING_ORDER_EASYNC_OPTS = "[ORDER] SAVING EASYNC ORDER OPTS"
export const SAVED_ORDER_EASYNC_OPTS = "[ORDER] SAVED EASYNC ORDER OPTS"

export function getOrder({orderId}) {
    const request = axios.get(`/api/orders/${orderId}`);
    const process = order => {
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

export default function DataDialog(data) {
    return (
        <>
            <DialogTitle>Data</DialogTitle>
            <DialogContent dividers>
                <JSONPretty 
                    id="json-pretty"
                    data={data}
                />
            </DialogContent>
        </>
    );
}

export function testSendOrder(orderId) {
    return async dispatch => {
        const { data } = await axios.post(`/api/test-send-order`, {
            orderId
        });
        if (data) {
            dispatch(
                Actions.openDialog({
                    children: (
                        <DataDialog
                            data={data}
                        />
                    )
                })
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

