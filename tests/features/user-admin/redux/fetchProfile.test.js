import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';

import {
  USER_ADMIN_FETCH_PROFILE_BEGIN,
  USER_ADMIN_FETCH_PROFILE_SUCCESS,
  USER_ADMIN_FETCH_PROFILE_FAILURE,
  USER_ADMIN_FETCH_PROFILE_DISMISS_ERROR,
} from '../../../../src/features/user-admin/redux/constants';

import {
  fetchProfile,
  dismissFetchProfileError,
  reducer,
} from '../../../../src/features/user-admin/redux/fetchProfile';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('user-admin/redux/fetchProfile', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('dispatches success action when fetchProfile succeeds', () => {
    const store = mockStore({});

    return store.dispatch(fetchProfile())
      .then(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', USER_ADMIN_FETCH_PROFILE_BEGIN);
        expect(actions[1]).toHaveProperty('type', USER_ADMIN_FETCH_PROFILE_SUCCESS);
      });
  });

  it('dispatches failure action when fetchProfile fails', () => {
    const store = mockStore({});

    return store.dispatch(fetchProfile({ error: true }))
      .catch(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', USER_ADMIN_FETCH_PROFILE_BEGIN);
        expect(actions[1]).toHaveProperty('type', USER_ADMIN_FETCH_PROFILE_FAILURE);
        expect(actions[1]).toHaveProperty('data.error', expect.anything());
      });
  });

  it('returns correct action by dismissFetchProfileError', () => {
    const expectedAction = {
      type: USER_ADMIN_FETCH_PROFILE_DISMISS_ERROR,
    };
    expect(dismissFetchProfileError()).toEqual(expectedAction);
  });

  it('handles action type USER_ADMIN_FETCH_PROFILE_BEGIN correctly', () => {
    const prevState = { fetchUserPending: false };
    const state = reducer(
      prevState,
      { type: USER_ADMIN_FETCH_PROFILE_BEGIN }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.fetchUserPending).toBe(true);
  });

  it('handles action type USER_ADMIN_FETCH_PROFILE_SUCCESS correctly', () => {
    const prevState = { fetchUserPending: true };
    const state = reducer(
      prevState,
      { type: USER_ADMIN_FETCH_PROFILE_SUCCESS, data: {} }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.fetchUserPending).toBe(false);
  });

  it('handles action type USER_ADMIN_FETCH_PROFILE_FAILURE correctly', () => {
    const prevState = { fetchUserPending: true };
    const state = reducer(
      prevState,
      { type: USER_ADMIN_FETCH_PROFILE_FAILURE, data: { error: new Error('some error') } }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.fetchUserPending).toBe(false);
    expect(state.fetchUserError).toEqual(expect.anything());
  });

  it('handles action type USER_ADMIN_FETCH_PROFILE_DISMISS_ERROR correctly', () => {
    const prevState = { fetchUserError: new Error('some error') };
    const state = reducer(
      prevState,
      { type: USER_ADMIN_FETCH_PROFILE_DISMISS_ERROR }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.fetchUserError).toBe(null);
  });
});

