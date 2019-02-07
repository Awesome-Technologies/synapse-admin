import React from 'react';
import { shallow } from 'enzyme';
import { List } from '../../../src/features/user-admin/List';

describe('user-admin/List', () => {
  it('renders node with correct class name', () => {
    const props = {
      userAdmin: {},
      actions: {},
    };
    const renderedComponent = shallow(
      <List {...props} />
    );

    expect(
      renderedComponent.find('.user-admin-list').length
    ).toBe(1);
  });
});
