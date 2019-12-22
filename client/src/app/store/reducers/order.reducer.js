import * as Actions from "../actions";

const initialState = {
    isFetching: false,
    activeOrder: null
};

const orderReducer = function(state = initialState, action) {
    switch (action.type) {
        case Actions.GET_ORDER: {
            return {
                isFetching: true
            };
        }
        case Actions.GOT_ORDER: {
            return {
                isFetching: false,
                activeOrder: action.payload
            };
        }
        default: {
            return state;
        }
    }
};

export default orderReducer;
