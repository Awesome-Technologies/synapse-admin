import React from 'react';
import { shallow } from 'enzyme';
import { Layout } from '../../../src/features/common';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<Layout />);
  expect(renderedComponent.find('.common-layout').length).toBe(1);
});
