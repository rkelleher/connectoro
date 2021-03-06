import axios from "axios";
import * as Actions from "app/store/actions";

export const GET_PRODUCT = "[PRODUCT] GET PRODUCT";
export const GOT_PRODUCT = "[PRODUCT] GOT PRODUCT";
export const SAVING_PRODUCT = "[PRODUCT] SAVING PRODUCT";
export const SAVED_PRODUCT = "[PRODUCT] SAVED PRODUCT";
export const SAVING_PRODUCT_EASYNC = "[PRODUCT] SAVING PRODUCT EASYNC";
export const SAVED_PRODUCT_EASYNC = "[PRODUCT] SAVED PRODUCT EASYNC";
export const SET_PRODUCT = "[PRODUCT] SET PRODUCT";

export function getProduct({ productId }) {
    const request = axios.get(`/api/products/${productId}`);
    const process = product => {
        return product;
    };
    return async dispatch => {
        dispatch({
            type: GET_PRODUCT
        });
        const response = await request;
        return dispatch({
            type: GOT_PRODUCT,
            payload: process(response.data)
        });
    };
}

export function saveProductDetails(form, productId) {
    return async dispatch => {
        try {
            dispatch({
                type: SAVING_PRODUCT
            });

            const { data } = await axios.patch(`/api/products/${productId}`, {
                changes: form
            });

            if (data) {
                dispatch({
                    type: SET_PRODUCT,
                    payload: data
                });
            } else {
                dispatch(
                    Actions.showMessage({
                        message: "Could not save Product, please try again"
                    })
                );
            }

            return dispatch({
                type: SAVED_PRODUCT
            });
        } catch (error) {
            dispatch(
                Actions.showMessage({
                    message: error.response.data.message
                })
            );
        }
    };
}

export function saveProductEasyncSelectionCriteriaOptions(form, productId) {
    return async dispatch => {
        dispatch({
            type: SAVING_PRODUCT_EASYNC
        });
        const changes = {
            "integrationData": {
                "EASYNC": {
                    "orderProductData": {
                        "selectionCriteria": form
                    }
                }
            }
        };
        const { data } = await axios.patch(`/api/products/${productId}`, {
            changes
        });
        if (data) {
            dispatch({
                type: SET_PRODUCT,
                payload: data
            });
        }
        return dispatch({
            type: SAVED_PRODUCT_EASYNC
        });
    };
}
