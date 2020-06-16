import accountService from "app/services/accountService";

export const SET_ACCOUNT = "[ACCOUNT] SET ACCOUNT";
export const START_ACCOUNT_FETCH = "[ACCOUNT] START FETCH";
export const SET_INTEGRATIONS = "[ACCOUNT] SET INTEGRATIONS";
export const SAVING_INTEGRATION_OPTS = "[ACCOUNT] SAVING INTG OPTS";
export const FINISHED_SAVING_INTEGRATION_OPTS = "[ACCOUNT] FIN SAVE INTG OPTS";
export const SAVING_ACC_EASYNC_ORDER_OPTS = "[ACCOUNT] SAVING ACC EASYC ORDER OPTS";
export const SAVED_ACC_EASYNC_ORDER_OPTS = "[ACCOUNT] SAVED ACC EASYC ORDER OPTS";
export const SAVING_ACC_EASYNC_PRODUCT_OPTS = "[ACCOUNT] SAVING ACC EASYC PRODUCT OPTS";
export const SAVED_ACC_EASYNC_PRODUCT_OPTS = "[ACCOUNT] SAVED ACC EASYC PRODUCT OPTS";
export const GET_INTEGRATION_DATA  = "[ACCOUNT] GET INTEGRATION DATA";
export const SET_INTEGRATION_DATA = "[ACCOUNT] SET INTEGRATION DATA";
export const SET_LINNWORKS_LOCATION_ID = "[ACCOUNT] SET LINNWORKS LOCATION ID";
export const SET_ACCOUNT_USERS = "[ACCOUNT] SET ACCOUNT USERS";
export const SET_ACCOUNT_RETAILER_CODES = "[ACCOUNT] SET ACCOUNT RETAILER CODES";
export const DELETE_ACCOUNT_RETAILER_CODE = "[ACCOUNT] DELETE ACCOUNT RETAILER CODE";


export function getAccountDetails() {
    return async dispatch => {
        dispatch({
            type: START_ACCOUNT_FETCH
        });
        const account = await accountService.fetchAccountDetails();
        return dispatch({
            type: SET_ACCOUNT,
            payload: account
        });
    };
}

export function getLinnworksData() {
    return async dispatch => {
        dispatch({
            type: GET_INTEGRATION_DATA
        });
        const { integrationData } = await accountService.fetchAccountLinnworksData();
        if (integrationData) {
            return dispatch({
                type: SET_INTEGRATION_DATA,
                payload: integrationData
            });
        }
    };
}

export function setLinnworksLocationId(id) {
    return async dispatch => {
        dispatch({
            type: SET_LINNWORKS_LOCATION_ID
        });

        const  { data }  = await accountService.sendLinnworksLocationData(id);
        if (data.StockLocationId) {
            return dispatch({
                type: SET_LINNWORKS_LOCATION_ID,
                payload: data.StockLocationId
            });
        }
    };
}

export function addNewIntegration(type) {
    return async dispatch => {
        const { integrations } = await accountService.sendNewIntegration(type);
        if (integrations) {
            return dispatch({
                type: SET_INTEGRATIONS,
                payload: integrations
            });
        }
    };
}

export function deleteIntegration(id) {
    return async dispatch => {
        const { integrations } = await accountService.deleteIntegration(id);
        if (integrations) {
            return dispatch({
                type: SET_INTEGRATIONS,
                payload: integrations
            });
        }
    };
}

export function addCredential(id, type, content) {
    return async dispatch => {
        const { integrations } = await accountService.addCredential(
            id,
            type,
            content
        );
        if (integrations) {
            return dispatch({
                type: SET_INTEGRATIONS,
                payload: integrations
            });
        }
    };
}

export function deleteCredential(id, type) {
    return async dispatch => {
        const { integrations } = await accountService.deleteCredential(
            id,
            type
        );
        if (integrations) {
            return dispatch({
                type: SET_INTEGRATIONS,
                payload: integrations
            });
        }
    };
}

export function saveIntegrationOptions(id, form) {
    return async dispatch => {
        dispatch({
            type: SAVING_INTEGRATION_OPTS
        });
        const { integrations } = await accountService.setIntegrationOptions(
            id,
            form
        );
        dispatch({
            type: FINISHED_SAVING_INTEGRATION_OPTS
        });
        if (integrations) {
            return dispatch({
                type: SET_INTEGRATIONS,
                payload: integrations
            });
        }
    };
}

export function saveAccountEasyncOrderOptions(orderData) {
    return async dispatch => {
        dispatch({
            type: SAVING_ACC_EASYNC_ORDER_OPTS
        });
        const changes = {
            "integrationData": {
                "EASYNC": {
                    "orderData": orderData 
                }
            }
        };
        const account = await accountService.updateAccount(changes);
        if (account) {
            dispatch({
                type: SET_ACCOUNT,
                payload: account
            });
        }
        return dispatch({
            type: SAVED_ACC_EASYNC_ORDER_OPTS
        });
    };
}

export function saveAccountEasyncProductSelectionCriteriaOptions(form) {
    return async dispatch => {
        dispatch({
            type: SAVING_ACC_EASYNC_PRODUCT_OPTS
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
        const account = await accountService.updateAccount(changes);
        if (account) {
            dispatch({
                type: SET_ACCOUNT,
                payload: account
            });
        }
        return dispatch({
            type: SAVED_ACC_EASYNC_PRODUCT_OPTS
        });
    };
}

export function getAccountUsers() {
    return async dispatch => {
        dispatch({
            type: START_ACCOUNT_FETCH
        });

        const users = await accountService.fetchAccountUsers();

        return dispatch({
            type: SET_ACCOUNT_USERS,
            payload: users
        });
    };
}

export function getAccountRetailerCodes() {
    return async dispatch => {
        dispatch({
            type: START_ACCOUNT_FETCH
        });

        const res = await accountService.fetchAccountRetailerCodes();

        return dispatch({
            type: SET_ACCOUNT_RETAILER_CODES,
            payload: res.retailerCodes
        });
    };
}

export function deleteAccountRetailerCode(retailerCode) {
    return async dispatch => {
        accountService.deleteAccountRetailerCode(retailerCode);

        return dispatch({
            type: DELETE_ACCOUNT_RETAILER_CODE,
            payload: retailerCode
        });
    };
}

