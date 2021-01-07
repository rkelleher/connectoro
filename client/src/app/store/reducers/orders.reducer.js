import * as Actions from '../actions';

const initialState = {
    data      : [],
    searchText: '',
    isFetching: false,
    status: 1,
    tracking: 1,
    count: 0,
    direction: 'dsc',
    page: 1,
    rowsPerPage: 100,
    paramsState : {}
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
                page: action.payload+1,
            };
        }
        case Actions.SET_ROWS_PER_PAGE:
        {
            return {
                ...state,
                rowsPerPage: action.payload,
            };
        }
        case Actions.SAVE_PARAMS:
        {
            return {
                ...state,
                paramsState: action.payload,
            };
        }
        case Actions.NEW_ORDER_SOCKET:
        {
            return {
                ...state,
                data: [action.payload, ...state.data],
            };
        }
        case Actions.UPDATE_ORDER_STATUS_SOCKET:
            const index = state.data.findIndex(data => data._id == action.id); //finding index of the item
            const newArray = [...state.data]; //making a new array
            if (index !== -1) {
                newArray[index].easyncOrderStatus.status = action.status //changing value in the new array
            }
        {
            return {
                ...state,
                data: newArray,
            };
        }
        case Actions.UPDATE_ORDER_TRACKING_SOCKET:
            const indexT = state.data.findIndex(data => data._id === action.id); //finding index of the item
            const newArrayT = [...state.data]; //making a new array
            if (index) {
                newArrayT[indexT].easyncTracking.status = action.tracking //changing value in the new array
            }
        {
            return {
                ...state,
                data: newArrayT,
            };
        }
        default:
        {
            return state;
        }
    }
};

export default ordersReducer;
