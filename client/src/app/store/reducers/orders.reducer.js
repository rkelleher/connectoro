import * as Actions from '../actions';

const initialState = {
    data      : [],
    searchText: '',
    isFetching: false,
    status: null,
    tracking: null,
};

const ordersReducer = function (state = initialState, action) {
    switch ( action.type )
    {
        case Actions.GOT_ORDERS:
        {
            return {
                ...state,
                data: action.payload,
                isFetching:false,
            };
        }
        case Actions.GET_ORDERS:
        {
            return {
                ...state,
                isFetching: true,
            };
        }
        case Actions.SET_STATUS_ORDER:
        {
            return {
                ...state,
                status: action.payload,
            };
        }
        case Actions.SET_TRACKING_ORDER:
        {
            return {
                ...state,
                tracking: action.payload,
            };
        }
        default:
        {
            return state;
        }
    }
};

export default ordersReducer;
