import * as Actions from '../actions';

const initialState = {
    data      : [],
    searchText: '',
    isFetching: false
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
        default:
        {
            return state;
        }
    }
};

export default ordersReducer;
