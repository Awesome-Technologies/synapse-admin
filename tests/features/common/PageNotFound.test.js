import React from 'react';
import { shallow } from 'enzyme';
import { PageNotFound } from '../../../src/features/common';

describe('common/PageNotFound', () => {
  it('renders node with correct class name', () => {
    const renderedComponent = shallow(<PageNotFound />);

    expect(renderedComponent.find('.common-page-not-found').length).toBe(1);
  });
});
