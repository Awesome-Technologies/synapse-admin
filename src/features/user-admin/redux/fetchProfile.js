import {
  USER_ADMIN_FETCH_PROFILE_BEGIN,
  USER_ADMIN_FETCH_PROFILE_SUCCESS,
  USER_ADMIN_FETCH_PROFILE_FAILURE,
  USER_ADMIN_FETCH_PROFILE_DISMISS_ERROR,
} from './constants';

export function fetchProfile(username) {
  return (dispatch, getState) => {
    dispatch({
      type: USER_ADMIN_FETCH_PROFILE_BEGIN,
    });

    const promise = new Promise((resolve, reject) => {
      const mtx = getState().common.mtx;
      const doRequest = mtx._http.authedRequest(undefined, "GET", "/profile/" + username, undefined)
      doRequest.then(
        (res) => {
          dispatch({
            type: USER_ADMIN_FETCH_PROFILE_SUCCESS,
            username: username,
            profile: res,
          });
          resolve(res);
        },
        // Use rejectHandler as the second argument so that render errors won't be caught.
        (err) => {
          dispatch({
            type: USER_ADMIN_FETCH_PROFILE_FAILURE,
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
export function dismissFetchProfileError() {
  return {
    type: USER_ADMIN_FETCH_PROFILE_DISMISS_ERROR,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case USER_ADMIN_FETCH_PROFILE_BEGIN:
      // Just after a request is sent
      return {
        ...state,
        fetchProfilePending: true,
        fetchProfileError: null,
      };

    case USER_ADMIN_FETCH_PROFILE_SUCCESS:
      // The request is success
      return {
        ...state,
        userProfiles: { ...state.userProfiles, [action.username]: action.profile },
        fetchProfilePending: false,
        fetchProfileError: null,
      };

    case USER_ADMIN_FETCH_PROFILE_FAILURE:
      // The request is failed
      return {
        ...state,
        fetchProfilePending: false,
        fetchProfileError: action.data.error,
      };

    case USER_ADMIN_FETCH_PROFILE_DISMISS_ERROR:
      // Dismiss the request failure error
      return {
        ...state,
        fetchProfileError: null,
      };

    default:
      return state;
  }
}
