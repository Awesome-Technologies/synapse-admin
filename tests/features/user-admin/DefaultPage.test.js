import React from 'react';
import { shallow } from 'enzyme';
import { DefaultPage } from '../../../src/features/user-admin/DefaultPage';

describe('user-admin/DefaultPage', () => {
  it('renders node with correct class name', () => {
    const props = {
      userAdmin: {},
      actions: {},
    };
    const renderedComponent = shallow(
      <DefaultPage {...props} />
    );

    expect(
      renderedComponent.find('.user-admin-default-page').length
    ).toBe(1);
  });
});
