import React from 'react';
import { shallow } from 'enzyme';
import { Layout } from '../../../src/features/examples';

describe('examples/Layout', () => {
  it('renders node with correct class name', () => {
    const renderedComponent = shallow(<Layout />);

    expect(renderedComponent.find('.examples-layout').length).toBe(1);
  });
});
