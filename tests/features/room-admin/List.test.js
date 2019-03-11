import React from 'react';
import { shallow } from 'enzyme';
import { List } from '../../../src/features/room-admin/List';

describe('room-admin/List', () => {
  it('renders node with correct class name', () => {
    const props = {
      roomAdmin: {},
      actions: {},
    };
    const renderedComponent = shallow(
      <List {...props} />
    );

    expect(
      renderedComponent.find('.room-admin-list').length
    ).toBe(1);
  });
});
