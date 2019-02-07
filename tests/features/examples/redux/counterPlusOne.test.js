import {
  EXAMPLES_COUNTER_PLUS_ONE,
} from '../../../../src/features/examples/redux/constants';

import {
  counterPlusOne,
  reducer,
} from '../../../../src/features/examples/redux/counterPlusOne';

describe('examples/redux/counterPlusOne', () => {
  it('returns correct action by counterPlusOne', () => {
    expect(counterPlusOne()).toHaveProperty('type', EXAMPLES_COUNTER_PLUS_ONE);
  });

  it('handles action type EXAMPLES_COUNTER_PLUS_ONE correctly', () => {
    const prevState = { count: 0 };
    const expectedState = { count: 1 };
    const state = reducer(
      prevState,
      { type: EXAMPLES_COUNTER_PLUS_ONE }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state).toEqual(expectedState); // TODO: replace this line with real case.
  });
});
