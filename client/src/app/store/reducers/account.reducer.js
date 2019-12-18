import * as Actions from "../actions/account.actions";

const initialState = {
    isFetching: false,
    isSavingIntegration: false,
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
        case Actions.SET_ACCOUNT: {
            return {
                ...initialState,
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
