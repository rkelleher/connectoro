import jwtService from 'app/services/jwtService';
import {setUserData} from './user.actions';
import { showMessage } from 'app/store/actions';

export const LOGIN_ERROR = 'LOGIN_ERROR';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';

export function submitLogin({email, password}) {
  return (dispatch) =>
    jwtService.signInWithEmailAndPassword(email, password)
      .then((response) => {
        if (response.user) {
          dispatch(setUserData(response.user));
          
          return dispatch({
            type: LOGIN_SUCCESS
          });
        } else {
          const problem = response.problem;
          if (problem === 'ERR_NO_USER_WITH_EMAIL') {
            return dispatch({
              type   : LOGIN_ERROR,
              payload: {
                email: 'No user found with this email'
              }
            });
          } else if (problem === 'ERR_WRONG_PASSWORD') {
            return dispatch({
              type: LOGIN_ERROR,
              payload: {
                password: 'Incorrect password'
              }
            });
          } else {
            throw new Error('No handler for server response')
          }
        }
      })
      .catch(error => {
        dispatch(showMessage({message: "Could not reach server, please try again later"}));
        return dispatch({
          type   : LOGIN_ERROR
        });
      });
}
