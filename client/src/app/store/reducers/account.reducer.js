import * as Actions from '../actions/account.actions';

const initialState = {
    isFetching: false,
    needsRefresh: true,
    email: '',
    integrations: [],
    users: []
};

const account = function (state = initialState, action) {
    switch ( action.type )
    {
        case Actions.START_ACCOUNT_FETCH:
        {
            return {
                ...state,
                isFetching: true,
                needsRefresh: false
            }
        }
        case Actions.SET_ACCOUNT:
        {
            return {
                ...initialState,
                ...action.payload,
                isFetching: false,
                needsRefresh: false
            }
        }
        case Actions.SET_INTEGRATIONS:
        {
            return {
                ...state,
                integrations: action.payload
            }
        }
        default:
        {
            return state;
        }
    }
};

export default account;
