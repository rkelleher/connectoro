import * as Actions from "../actions";

const initialState = {
    isFetching: false,
    isSavingDetails: false,
    activeProduct: null,
    isSavingEasyncSelectionCriteria: false
};

const productReducer = function(state = initialState, action) {
    switch (action.type) {
        case Actions.GET_PRODUCT: {
            return {
                isFetching: true
            };
        }
        case Actions.GOT_PRODUCT: {
            return {
                isFetching: false,
                activeProduct: action.payload
            };
        }
        case Actions.SAVING_PRODUCT: {
            return {
                ...state,
                isSavingDetails: true
            }
        }
        case Actions.SAVED_PRODUCT: {
            return {
                ...state,
                isSavingDetails: false
            }
        }
        case Actions.SAVING_PRODUCT_EASYNC: {
            return {
                ...state,
                isSavingEasyncSelectionCriteria: true
            }
        }
        case Actions.SAVED_PRODUCT_EASYNC: {
            return {
                ...state,
                isSavingEasyncSelectionCriteria: false
            }
        }
        case Actions.SET_PRODUCT: {
            return {
                ...state,
                activeProduct: action.payload
            }
        }
        default: {
            return state;
        }
    }
};

export default productReducer;
