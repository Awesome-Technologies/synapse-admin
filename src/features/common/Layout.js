import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SidePanel } from './';

export default class Layout extends Component {
  static propTypes = {
    children: PropTypes.node,
  };

  render() {
    return (
      <div className="common-layout">
        <SidePanel />
        <div className="common-page-container">
          {this.props.children}
        </div>
      </div>
    );
  }
}
