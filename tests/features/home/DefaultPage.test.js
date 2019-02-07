import React from 'react';
import { shallow } from 'enzyme';
import { DefaultPage } from '../../../src/features/home/DefaultPage';

describe('home/DefaultPage', () => {
  it('renders node with correct class name', () => {
    const props = {
      home: {},
      actions: {},
    };
    const renderedComponent = shallow(<DefaultPage {...props} />);

    expect(renderedComponent.find('.home-default-page').length).toBe(1);
  });
});
