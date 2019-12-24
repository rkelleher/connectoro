import * as Actions from "../actions";

const initialState = {
    isFetching: false,
    activeOrder: null,
    easyncOptionsSaving: false,
    savingOrderCustomer: false
};

const orderReducer = function(state = initialState, action) {
    switch (action.type) {
        case Actions.GET_ORDER: {
            return {
                ...state,
                isFetching: true
            };
        }
        case Actions.GOT_ORDER: {
            return {
                ...state,
                isFetching: false,
                activeOrder: action.payload
            };
        }
        case Actions.SET_ORDER: {
            return {
                ...state,
                activeOrder: action.payload
            };
        }
        case Actions.SAVING_ORDER_EASYNC_OPTS: {
            return {
                ...state,
                easyncOptionsSaving: true
            }
        }
        case Actions.SAVED_ORDER_EASYNC_OPTS: {
            return {
                ...state,
                easyncOptionsSaving: false
            }
        }
        case Actions.SAVING_ORDER: {
            return {
                ...state,
                savingOrderCustomer: true
            }
        }
        case Actions.SAVED_ORDER: {
            return {
                ...state,
                savingOrderCustomer: false
            }
        }
        default: {
            return state;
        }
    }
};

export default orderReducer;
