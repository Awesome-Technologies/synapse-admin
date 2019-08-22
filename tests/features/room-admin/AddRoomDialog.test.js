import React from 'react';
import { shallow } from 'enzyme';
import { AddRoomDialog } from '../../../src/features/room-admin/AddRoomDialog';

describe('room-admin/AddRoomDialog', () => {
  it('renders node with correct class name', () => {
    const props = {
      roomAdmin: {},
      actions: {},
    };
    const renderedComponent = shallow(
      <AddRoomDialog {...props} />
    );

    expect(
      renderedComponent.find('.room-admin-add-room-dialog').length
    ).toBe(1);
  });
});
