import {
  ROOM_ADMIN_FETCH_PUBLIC_ROOMS_BEGIN,
  ROOM_ADMIN_FETCH_PUBLIC_ROOMS_SUCCESS,
  ROOM_ADMIN_FETCH_PUBLIC_ROOMS_FAILURE,
  ROOM_ADMIN_FETCH_PUBLIC_ROOMS_DISMISS_ERROR,
} from './constants';

// Rekit uses redux-thunk for async actions by default: https://github.com/gaearon/redux-thunk
// If you prefer redux-saga, you can use rekit-plugin-redux-saga: https://github.com/supnate/rekit-plugin-redux-saga
export function fetchPublicRooms(args = {}) {
  return (dispatch, getState) => {
    dispatch({
      type: ROOM_ADMIN_FETCH_PUBLIC_ROOMS_BEGIN,
    });

    const promise = new Promise((resolve, reject) => {
      const mtx = getState().common.mtx;
      const doRequest = mtx.publicRooms();
      doRequest.then(
        (res) => {
          dispatch({
            type: ROOM_ADMIN_FETCH_PUBLIC_ROOMS_SUCCESS,
            data: res,
          });
          resolve(res);
        },
        // Use rejectHandler as the second argument so that render errors won't be caught.
        (err) => {
          dispatch({
            type: ROOM_ADMIN_FETCH_PUBLIC_ROOMS_FAILURE,
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
export function dismissFetchPublicRoomsError() {
  return {
    type: ROOM_ADMIN_FETCH_PUBLIC_ROOMS_DISMISS_ERROR,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case ROOM_ADMIN_FETCH_PUBLIC_ROOMS_BEGIN:
      // Just after a request is sent
      return {
        ...state,
        fetchPublicRoomsPending: true,
        fetchPublicRoomsError: null,
      };

    case ROOM_ADMIN_FETCH_PUBLIC_ROOMS_SUCCESS:
      // The request is success
      return {
        ...state,
        roomList: action.data.chunk,
        fetchPublicRoomsPending: false,
        fetchPublicRoomsError: null,
        //roomList: action.data.chunk,
      };

    case ROOM_ADMIN_FETCH_PUBLIC_ROOMS_FAILURE:
      // The request is failed
      return {
        ...state,
        fetchPublicRoomsPending: false,
        fetchPublicRoomsError: action.data.error,
      };

    case ROOM_ADMIN_FETCH_PUBLIC_ROOMS_DISMISS_ERROR:
      // Dismiss the request failure error
      return {
        ...state,
        fetchPublicRoomsError: null,
      };

    default:
      return state;
  }
}
