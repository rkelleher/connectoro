import * as Actions from "../actions/account.actions";

const initialState = {
    isFetching: false,
    isSavingIntegration: false,
    isSavingEasyncOrderOptions: false,
    isSavingEasyncProductOptions: false,
    email: "",
    integrations: [],
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
        default: {
            return state;
        }
    }
};

export default account;
