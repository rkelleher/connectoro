import accountService from "app/services/accountService";

export const SET_ACCOUNT = '[ACCOUNT] SET ACCOUNT';
export const START_ACCOUNT_FETCH = '[ACCOUNT] START FETCH';
export const SET_INTEGRATIONS = '[ACCOUNT] SET INTEGRATIONS';

export function getAccountDetails() {
  return async (dispatch) => {
    dispatch({
      type: START_ACCOUNT_FETCH
    });
    const account = await accountService.fetchAccountDetails();
    return dispatch({
      type: SET_ACCOUNT,
      payload: account
    })
  }
}

export function addNewIntegration(type) {
  return async (dispatch) => {
    const {integrations} = await accountService.sendNewIntegration(type);
    return dispatch({
      type: SET_INTEGRATIONS,
      payload: integrations
    })
  }
}
