import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import matrixLogo from '../../images/matrix-logo.svg';
import * as actions from './redux/actions';

export class SidePanel extends Component {
  static propTypes = {
    common: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div className="common-side-panel">
        <div className="header">
          <img src={matrixLogo} className="app-logo" alt="logo" />
        </div>
        <ul className="nav">
          <li>
            <NavLink to="/user-admin">Users</NavLink>
          </li>
          <li>
            <NavLink to="/room-admin">Rooms</NavLink>
          </li>
        </ul>
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    common: state.common,
  };
}

/* istanbul ignore next */
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...actions }, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SidePanel);
