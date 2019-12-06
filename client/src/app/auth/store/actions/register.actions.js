import * as UserActions from './user.actions';
import jwtService from 'app/services/jwtService';
import { showMessage } from 'app/store/actions';

export const REGISTER_ERROR = 'REGISTER_ERROR';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';

export function submitRegister({displayName, password, email})
{
    return (dispatch) =>
        jwtService.createUser({
            displayName,
            password,
            email
        })
            .then((response) => {
                    if (response.user) {
                        dispatch(UserActions.setUserData(response.user));
                        return dispatch({
                            type: REGISTER_SUCCESS
                        });
                    } else {
                        const problem = response.problem;
                        if (problem === 'ERR_EMAIL_TAKEN') {
                            return dispatch({
                                type: REGISTER_ERROR,
                                payload: {
                                    email: 'A user with this email already exists'
                                }
                            })
                        } else {
                            throw new Error('No handler for server response')
                        }
                    }
                }
            )
            .catch(error => {
                dispatch(showMessage({message: "Could not reach server, please try again later"}));
                return dispatch({
                    type   : REGISTER_ERROR
                });
            });
}
