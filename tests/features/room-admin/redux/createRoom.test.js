import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';

import {
  ROOM_ADMIN_CREATE_ROOM_BEGIN,
  ROOM_ADMIN_CREATE_ROOM_SUCCESS,
  ROOM_ADMIN_CREATE_ROOM_FAILURE,
  ROOM_ADMIN_CREATE_ROOM_DISMISS_ERROR,
} from '../../../../src/features/room-admin/redux/constants';

import {
  createRoom,
  dismissCreateRoomError,
  reducer,
} from '../../../../src/features/room-admin/redux/createRoom';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('room-admin/redux/createRoom', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('dispatches success action when createRoom succeeds', () => {
    const store = mockStore({});

    return store.dispatch(createRoom())
      .then(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', ROOM_ADMIN_CREATE_ROOM_BEGIN);
        expect(actions[1]).toHaveProperty('type', ROOM_ADMIN_CREATE_ROOM_SUCCESS);
      });
  });

  it('dispatches failure action when createRoom fails', () => {
    const store = mockStore({});

    return store.dispatch(createRoom({ error: true }))
      .catch(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', ROOM_ADMIN_CREATE_ROOM_BEGIN);
        expect(actions[1]).toHaveProperty('type', ROOM_ADMIN_CREATE_ROOM_FAILURE);
        expect(actions[1]).toHaveProperty('data.error', expect.anything());
      });
  });

  it('returns correct action by dismissCreateRoomError', () => {
    const expectedAction = {
      type: ROOM_ADMIN_CREATE_ROOM_DISMISS_ERROR,
    };
    expect(dismissCreateRoomError()).toEqual(expectedAction);
  });

  it('handles action type ROOM_ADMIN_CREATE_ROOM_BEGIN correctly', () => {
    const prevState = { registerRoomPending: false };
    const state = reducer(
      prevState,
      { type: ROOM_ADMIN_CREATE_ROOM_BEGIN }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.registerRoomPending).toBe(true);
  });

  it('handles action type ROOM_ADMIN_CREATE_ROOM_SUCCESS correctly', () => {
    const prevState = { registerRoomPending: true };
    const state = reducer(
      prevState,
      { type: ROOM_ADMIN_CREATE_ROOM_SUCCESS, data: {} }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.registerRoomPending).toBe(false);
  });

  it('handles action type ROOM_ADMIN_CREATE_ROOM_FAILURE correctly', () => {
    const prevState = { registerRoomPending: true };
    const state = reducer(
      prevState,
      { type: ROOM_ADMIN_CREATE_ROOM_FAILURE, data: { error: new Error('some error') } }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.registerRoomPending).toBe(false);
    expect(state.registerRoomError).toEqual(expect.anything());
  });

  it('handles action type ROOM_ADMIN_CREATE_ROOM_DISMISS_ERROR correctly', () => {
    const prevState = { registerRoomError: new Error('some error') };
    const state = reducer(
      prevState,
      { type: ROOM_ADMIN_CREATE_ROOM_DISMISS_ERROR }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.registerRoomError).toBe(null);
  });
});

