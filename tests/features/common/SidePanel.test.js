import React from 'react';
import { shallow } from 'enzyme';
import { SidePanel } from '../../../src/features/common/SidePanel';

describe('common/SidePanel', () => {
  it('renders node with correct class name', () => {
    const props = {
      common: {},
      actions: {},
    };
    const renderedComponent = shallow(
      <SidePanel {...props} />
    );

    expect(
      renderedComponent.find('.common-side-panel').length
    ).toBe(1);
  });
});
