import React from 'react';
import { shallow } from 'enzyme';
import { WelcomePage } from '../../../src/features/examples/WelcomePage';

describe('examples/WelcomePage', () => {
  it('renders node with correct class name', () => {
    const props = {
      examples: {},
      actions: {},
    };
    const renderedComponent = shallow(<WelcomePage {...props} />);

    expect(renderedComponent.find('.examples-welcome-page').length).toBe(1);
  });
});
