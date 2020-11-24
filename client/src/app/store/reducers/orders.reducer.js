import * as Actions from '../actions';

const initialState = {
    data      : [],
    searchText: '',
    isFetching: false,
    status: undefined,
    tracking: undefined,
    count: 0,
    direction: undefined,
    page: undefined,
    rowsPerPage: undefined,
};

const ordersReducer = function (state = initialState, action) {
    switch ( action.type )
    {
        case Actions.GOT_ORDERS:
        {
            return {
                ...state,
                data: action.payload.orders,
                count: action.payload.count,
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
        case Actions.SET_DIRECTION:
        {
            return {
                ...state,
                direction: action.payload,
            };
        }
        case Actions.SET_PAGE:
        {
            return {
                ...state,
                page: action.payload,
            };
        }
        case Actions.SET_ROWS_PER_PAGE:
        {
            return {
                ...state,
                rowsPerPage: action.payload,
            };
        }
        default:
        {
            return state;
        }
    }
};

export default ordersReducer;
