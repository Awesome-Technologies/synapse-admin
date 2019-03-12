import {
  HOME_LOGIN_BEGIN,
  HOME_LOGIN_SUCCESS,
  HOME_LOGIN_FAILURE,
  HOME_LOGIN_DISMISS_ERROR,
} from './constants';
import Matrix from 'matrix-js-sdk';

export function login(homeserver, username, password) {
  return (dispatch, getState) => {
    dispatch({
      type: HOME_LOGIN_BEGIN,
    });

    // Return a promise so that you could control UI flow without states in the store.
    // For example: after submit a form, you need to redirect the page to another when succeeds or show some errors message if fails.
    // It's hard to use state to manage it, but returning a promise allows you to easily achieve it.
    // e.g.: handleSubmit() { this.props.actions.submitForm(data).then(()=> {}).catch(() => {}); }
    const promise = new Promise((resolve, reject) => {
      var state = getState();
      state.common.mtx = Matrix.createClient(homeserver);
      const doRequest = state.common.mtx.login("m.login.password", { "user": username, "password": password });
      doRequest.then(
        (res) => {
          state.common.mtx.startClient();
          dispatch({
            type: HOME_LOGIN_SUCCESS,
            data: res,
          });
          resolve(res);
        },
        // Use rejectHandler as the second argument so that render errors won't be caught.
        (err) => {
          dispatch({
            type: HOME_LOGIN_FAILURE,
            data: { error: err },
          });
          reject(err.message);
        },
      );
    });

    return promise;
  };
}

// Async action saves request error by default, this method is used to dismiss the error info.
// If you don't want errors to be saved in Redux store, just ignore this method.
export function dismissLoginError() {
  return {
    type: HOME_LOGIN_DISMISS_ERROR,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case HOME_LOGIN_BEGIN:
      // Just after a request is sent
      return {
        ...state,
        loginPending: true,
        loginError: null,
      };

    case HOME_LOGIN_SUCCESS:
      // The request is success
      return {
        ...state,
        loginPending: false,
        loginError: null,
      };

    case HOME_LOGIN_FAILURE:
      // The request is failed
      return {
        ...state,
        loginPending: false,
        loginError: action.data.error,
      };

    case HOME_LOGIN_DISMISS_ERROR:
      // Dismiss the request failure error
      return {
        ...state,
        loginError: null,
      };

    default:
      return state;
  }
}
