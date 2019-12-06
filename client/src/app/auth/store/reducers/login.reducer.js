import * as Actions from '../actions';

const initialState = {
    success: false,
    error  : {
        email: null,
        password: null
    }
};

const login = function (state = initialState, action) {
    switch ( action.type )
    {
        case Actions.LOGIN_SUCCESS:
        {
            return {
                ...initialState,
                success: true
            };
        }
        case Actions.LOGIN_ERROR:
        {
            const payload = action.payload;

            if (!payload) {
                return {success: false}
            } else {
                return {
                    success: false,
                    error: payload
                };
            }
        }
        default:
        {
            return state
        }
    }
};

export default login;
