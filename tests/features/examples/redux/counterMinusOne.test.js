import {
  EXAMPLES_COUNTER_MINUS_ONE,
} from '../../../../src/features/examples/redux/constants';

import {
  counterMinusOne,
  reducer,
} from '../../../../src/features/examples/redux/counterMinusOne';

describe('examples/redux/counterMinusOne', () => {
  it('returns correct action by counterMinusOne', () => {
    expect(counterMinusOne()).toHaveProperty('type', EXAMPLES_COUNTER_MINUS_ONE);
  });

  it('handles action type EXAMPLES_COUNTER_MINUS_ONE correctly', () => {
    const prevState = { count: 3 };
    // TODO: use real expected state.
    const expectedState = { count: 2 };

    const state = reducer(
      prevState,
      { type: EXAMPLES_COUNTER_MINUS_ONE }
    );
    // Should be immutable
    expect(state).not.toBe(prevState);
    expect(state).toEqual(expectedState);
  });
});
