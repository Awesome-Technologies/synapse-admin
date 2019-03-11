import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';

import {
  ROOM_ADMIN_FETCH_PUBLIC_ROOMS_BEGIN,
  ROOM_ADMIN_FETCH_PUBLIC_ROOMS_SUCCESS,
  ROOM_ADMIN_FETCH_PUBLIC_ROOMS_FAILURE,
  ROOM_ADMIN_FETCH_PUBLIC_ROOMS_DISMISS_ERROR,
} from '../../../../src/features/room-admin/redux/constants';

import {
  fetchPublicRooms,
  dismissFetchPublicRoomsError,
  reducer,
} from '../../../../src/features/room-admin/redux/fetchPublicRooms';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('room-admin/redux/fetchPublicRooms', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('dispatches success action when fetchPublicRooms succeeds', () => {
    const store = mockStore({});

    return store.dispatch(fetchPublicRooms())
      .then(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', ROOM_ADMIN_FETCH_PUBLIC_ROOMS_BEGIN);
        expect(actions[1]).toHaveProperty('type', ROOM_ADMIN_FETCH_PUBLIC_ROOMS_SUCCESS);
      });
  });

  it('dispatches failure action when fetchPublicRooms fails', () => {
    const store = mockStore({});

    return store.dispatch(fetchPublicRooms({ error: true }))
      .catch(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', ROOM_ADMIN_FETCH_PUBLIC_ROOMS_BEGIN);
        expect(actions[1]).toHaveProperty('type', ROOM_ADMIN_FETCH_PUBLIC_ROOMS_FAILURE);
        expect(actions[1]).toHaveProperty('data.error', expect.anything());
      });
  });

  it('returns correct action by dismissFetchPublicRoomsError', () => {
    const expectedAction = {
      type: ROOM_ADMIN_FETCH_PUBLIC_ROOMS_DISMISS_ERROR,
    };
    expect(dismissFetchPublicRoomsError()).toEqual(expectedAction);
  });

  it('handles action type ROOM_ADMIN_FETCH_PUBLIC_ROOMS_BEGIN correctly', () => {
    const prevState = { fetchPublicRoomsPending: false };
    const state = reducer(
      prevState,
      { type: ROOM_ADMIN_FETCH_PUBLIC_ROOMS_BEGIN }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.fetchPublicRoomsPending).toBe(true);
  });

  it('handles action type ROOM_ADMIN_FETCH_PUBLIC_ROOMS_SUCCESS correctly', () => {
    const prevState = { fetchPublicRoomsPending: true };
    const state = reducer(
      prevState,
      { type: ROOM_ADMIN_FETCH_PUBLIC_ROOMS_SUCCESS, data: {} }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.fetchPublicRoomsPending).toBe(false);
  });

  it('handles action type ROOM_ADMIN_FETCH_PUBLIC_ROOMS_FAILURE correctly', () => {
    const prevState = { fetchPublicRoomsPending: true };
    const state = reducer(
      prevState,
      { type: ROOM_ADMIN_FETCH_PUBLIC_ROOMS_FAILURE, data: { error: new Error('some error') } }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.fetchPublicRoomsPending).toBe(false);
    expect(state.fetchPublicRoomsError).toEqual(expect.anything());
  });

  it('handles action type ROOM_ADMIN_FETCH_PUBLIC_ROOMS_DISMISS_ERROR correctly', () => {
    const prevState = { fetchPublicRoomsError: new Error('some error') };
    const state = reducer(
      prevState,
      { type: ROOM_ADMIN_FETCH_PUBLIC_ROOMS_DISMISS_ERROR }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.fetchPublicRoomsError).toBe(null);
  });
});

