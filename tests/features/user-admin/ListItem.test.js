import React from 'react';
import { shallow } from 'enzyme';
import { ListItem } from '../../../src/features/user-admin/ListItem';

describe('user-admin/ListItem', () => {
  it('renders node with correct class name', () => {
    const props = {
      userAdmin: {},
      actions: {},
    };
    const renderedComponent = shallow(
      <ListItem {...props} />
    );

    expect(
      renderedComponent.find('.user-admin-list-item').length
    ).toBe(1);
  });
});
