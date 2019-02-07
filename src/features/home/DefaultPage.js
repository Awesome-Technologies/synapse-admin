import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import reactLogo from '../../images/react-logo.svg';
import rekitLogo from '../../images/rekit-logo.svg';
import * as actions from './redux/actions';

export class DefaultPage extends Component {
  static propTypes = {
    home: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div className="home-default-page">
        <header className="app-header">
          <img src={reactLogo} className="app-logo" alt="logo" />
          <img src={rekitLogo} className="rekit-logo" alt="logo" />
          <h1 className="app-title">Welcome to React</h1>
        </header>
        <div className="app-intro">
          <h3>To get started:</h3>
          <ul>
            <li>
              Edit component{' '}
              <a
                href="http://localhost:6076/element/src%2Ffeatures%2Fhome%2FDefaultPage.js/code"
                target="_blank"
                rel="noopener noreferrer"
              >
                src/features/home/DefaultPage.js
              </a>{' '}
              for this page.
            </li>
            <li>
              Edit component{' '}
              <a
                href="http://localhost:6076/element/src%2Ffeatures%2Fhome%2FApp.js/code"
                target="_blank"
                rel="noopener noreferrer"
              >
                src/features/home/App.js
              </a>{' '}
              for the root container layout.
            </li>
            <li>
              To see examples, access:&nbsp;
              <Link to="/examples">/examples</Link>
            </li>
            <li>
              Rekit Studio is running at:&nbsp;
              <a href="http://localhost:6076/" target="_blank" rel="noopener noreferrer">
                http://localhost:6076/
              </a>.
            </li>
          </ul>
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(DefaultPage);
