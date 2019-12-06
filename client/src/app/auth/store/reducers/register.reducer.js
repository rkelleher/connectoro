import * as Actions from '../actions';

const initialState = {
    success: false,
    error  : {
        email: null
    }
};

const register = function (state = initialState, action) {
    switch ( action.type )
    {
        case Actions.REGISTER_SUCCESS:
        {
            return {
                ...initialState,
                success: true
            };
        }
        case Actions.REGISTER_ERROR:
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

export default register;
