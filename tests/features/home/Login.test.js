import React from 'react';
import { shallow } from 'enzyme';
import { Login } from '../../../src/features/home/Login';

describe('home/Login', () => {
  it('renders node with correct class name', () => {
    const props = {
      home: {},
      actions: {},
    };
    const renderedComponent = shallow(<Login {...props} />);

    expect(renderedComponent.find('.home-login').length).toBe(1);
  });
});
