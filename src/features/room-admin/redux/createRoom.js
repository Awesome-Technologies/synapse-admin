import {
  ROOM_ADMIN_CREATE_ROOM_BEGIN,
  ROOM_ADMIN_CREATE_ROOM_SUCCESS,
  ROOM_ADMIN_CREATE_ROOM_FAILURE,
  ROOM_ADMIN_CREATE_ROOM_DISMISS_ERROR,
} from './constants';

// For options see https://matrix.org/docs/spec/client_server/r0.5.0#post-matrix-client-r0-createroom
export function createRoom(options) {
  return (dispatch, getState) => {
    dispatch({
      type: ROOM_ADMIN_CREATE_ROOM_BEGIN,
    });

    const promise = new Promise((resolve, reject) => {
      const mtx = getState().common.mtx;
      if (!mtx) return;
      const doRequest = mtx.createRoom(options);
      doRequest.then(
        (res) => {
          dispatch({
            type: ROOM_ADMIN_CREATE_ROOM_SUCCESS,
            data: res,
          });
          resolve(res);
        },
        // Use rejectHandler as the second argument so that render errors won't be caught.
        (err) => {
          dispatch({
            type: ROOM_ADMIN_CREATE_ROOM_FAILURE,
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
export function dismissCreateRoomError() {
  return {
    type: ROOM_ADMIN_CREATE_ROOM_DISMISS_ERROR,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case ROOM_ADMIN_CREATE_ROOM_BEGIN:
      // Just after a request is sent
      return {
        ...state,
        createRoomPending: true,
        createRoomError: null,
      };

    case ROOM_ADMIN_CREATE_ROOM_SUCCESS:
      // The request is success
      return {
        ...state,
        createRoomPending: false,
        createRoomError: null,
      };

    case ROOM_ADMIN_CREATE_ROOM_FAILURE:
      // The request is failed
      return {
        ...state,
        createRoomPending: false,
        createRoomError: action.data.error,
      };

    case ROOM_ADMIN_CREATE_ROOM_DISMISS_ERROR:
      // Dismiss the request failure error
      return {
        ...state,
        createRoomError: null,
      };

    default:
      return state;
  }
}
