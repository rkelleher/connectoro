import * as Actions from "../actions/account.actions";

const initialState = {
    isFetching: false,
    isSavingIntegration: false,
    isSavingEasyncOrderOptions: false,
    isSavingEasyncProductOptions: false,
    email: "",
    integrations: [],
    integrationData: [],
    StockLocationId: "",
    users: []
};

const account = function(state = initialState, action) {
    switch (action.type) {
        case Actions.START_ACCOUNT_FETCH: {
            return {
                ...state,
                isFetching: true
            };
        }
        case Actions.SAVING_INTEGRATION_OPTS: {
            return {
                ...state,
                isSavingIntegration: true
            };
        }
        case Actions.FINISHED_SAVING_INTEGRATION_OPTS: {
            return {
                ...state,
                isSavingIntegration: false
            };
        }
        case Actions.SAVING_ACC_EASYNC_ORDER_OPTS: {
            return {
                ...state,
                isSavingEasyncOrderOptions: true
            }
        }
        case Actions.SAVED_ACC_EASYNC_ORDER_OPTS: {
            return {
                ...state,
                isSavingEasyncOrderOptions: false
            }
        }
        case Actions.SAVING_ACC_EASYNC_PRODUCT_OPTS: {
            return {
                ...state,
                isSavingEasyncProductOptions: true
            }
        }
        case Actions.SAVED_ACC_EASYNC_PRODUCT_OPTS: {
            return {
                ...state,
                isSavingEasyncProductOptions: false
            }
        }
        case Actions.SET_ACCOUNT: {
            return {
                ...state,
                ...action.payload,
                isFetching: false
            };
        }
        case Actions.SET_INTEGRATIONS: {
            return {
                ...state,
                integrations: action.payload
            };
        }
        case Actions.SET_INTEGRATION_DATA: {
            return {
                ...state,
                integrationData: action.payload
            };
        }
        case Actions.GET_INTEGRATION_DATA: {
            return {
                ...state,
            };
        }
        case Actions.SET_LINNWORKS_LOCATION_ID: {
            return {
                ...state,
                StockLocationId: action.payload
            };
        }
        case Actions.SET_ACCOUNT_USERS: {
            return {
                ...state,
                users: action.payload,
                isFetching: false
            };
        }
        case Actions.SET_ACCOUNT_RETAILER_CODES: {
            return {
                ...state,
                retailerCodes: action.payload,
                isFetching: false
            };
        }
        case Actions.DELETE_ACCOUNT_RETAILER_CODE: {
            return {
                ...state,
                retailerCodes: state.retailerCodes.filter(
                    ({ retailerCode })  => retailerCode !== action.payload
                )
            };
        }

        default: {
            return state;
        }
    }
};

export default account;
