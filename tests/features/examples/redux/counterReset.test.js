import {
  EXAMPLES_COUNTER_RESET,
} from '../../../../src/features/examples/redux/constants';

import {
  counterReset,
  reducer,
} from '../../../../src/features/examples/redux/counterReset';

describe('examples/redux/counterReset', () => {
  it('returns correct action by counterReset', () => {
    expect(counterReset()).toHaveProperty('type', EXAMPLES_COUNTER_RESET);
  });

  it('handles action type EXAMPLES_COUNTER_RESET correctly', () => {
    const prevState = { count: 10 };
    const expectedState = { count: 0 };
    const state = reducer(
      prevState,
      { type: EXAMPLES_COUNTER_RESET }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state).toEqual(expectedState); // TODO: replace this line with real case.
  });
});
