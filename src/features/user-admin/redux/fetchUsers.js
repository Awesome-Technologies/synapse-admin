import {
  USER_ADMIN_FETCH_USERS_BEGIN,
  USER_ADMIN_FETCH_USERS_SUCCESS,
  USER_ADMIN_FETCH_USERS_FAILURE,
  USER_ADMIN_FETCH_USERS_DISMISS_ERROR,
} from './constants';

export function fetchUsers(args = {}) {
  return (dispatch, getState) => {
    dispatch({
      type: USER_ADMIN_FETCH_USERS_BEGIN,
    });

    // Return a promise so that you could control UI flow without states in the store.
    // For example: after submit a form, you need to redirect the page to another when succeeds or show some errors message if fails.
    // It's hard to use state to manage it, but returning a promise allows you to easily achieve it.
    // e.g.: handleSubmit() { this.props.actions.submitForm(data).then(()=> {}).catch(() => {}); }
    const promise = new Promise((resolve, reject) => {
      const mtx = getState().common.mtx;
      const doRequest = mtx._http.authedRequest(undefined, "GET", "/admin/users/" + mtx.credentials.userId)
      doRequest.then(
        (res) => {
          dispatch({
            type: USER_ADMIN_FETCH_USERS_SUCCESS,
            data: res,
          });
          resolve(res);
        },
        // Use rejectHandler as the second argument so that render errors won't be caught.
        (err) => {
          dispatch({
            type: USER_ADMIN_FETCH_USERS_FAILURE,
            data: { error: err },
          });
          reject(err);
        },
      );
    });

    return promise;
  };
}

// Async action saves request error by default, this method is used to dismiss the error info.
// If you don't want errors to be saved in Redux store, just ignore this method.
export function dismissFetchUsersError() {
  return {
    type: USER_ADMIN_FETCH_USERS_DISMISS_ERROR,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case USER_ADMIN_FETCH_USERS_BEGIN:
      // Just after a request is sent
      return {
        ...state,
        fetchUsersPending: true,
        fetchUsersError: null,
      };

    case USER_ADMIN_FETCH_USERS_SUCCESS:
      // The request is success
      return {
        ...state,
        userList: action.data,
        fetchUsersPending: false,
        fetchUsersError: null,
      };

    case USER_ADMIN_FETCH_USERS_FAILURE:
      // The request is failed
      return {
        ...state,
        fetchUsersPending: false,
        fetchUsersError: action.data.error,
      };

    case USER_ADMIN_FETCH_USERS_DISMISS_ERROR:
      // Dismiss the request failure error
      return {
        ...state,
        fetchUsersError: null,
      };

    default:
      return state;
  }
}
