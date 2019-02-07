import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import matrixLogo from '../../images/matrix-logo.svg';
import * as actions from './redux/actions';

export class Login extends Component {
  static propTypes = {
    home: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div className="home-login">
        <header className="app-header">
          <img src={matrixLogo} className="app-logo" alt="logo" />
          <h1 className="app-title">Welcome to Synapse Admin</h1>
        </header>
        <form className="app-login">
          <table>
            <tbody>
              <tr>
                <th>Username:</th><td><input name="user"/></td>
              </tr>
              <tr>
                <th>Password:</th><td><input name="password" type="password"/></td>
              </tr>
            </tbody>
          </table>
          <Link to="/user-admin/list">Login</Link>
        </form>
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    home: state.home,
  };
}

/* istanbul ignore next */
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...actions }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
