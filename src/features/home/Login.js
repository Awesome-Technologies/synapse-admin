import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom'
import { Button, TextField } from '@material-ui/core';
import matrixLogo from '../../images/matrix-logo.svg';
import * as actions from './redux/actions';

export class Login extends Component {
  static propTypes = {
    home: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      homeserver: 'https://matrix.org',
      username: '',
      password: '',
      submitted: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.setState({ submitted: true });
    const { homeserver, username, password } = this.state;
    const { login } = this.props.actions;
    const { history } = this.props;
    if (homeserver && username && password) {
      login(homeserver, username, password).then(
        history.push("/user-admin/list")
      );
    }
  }

  render() {
    const { mtx } = this.props;
    const { loginPending } = this.props.home;
    const { homeserver, username, password, submitted } = this.state;
    return (
      <div className="home-login">
        {mtx && mtx.clientRunning &&
          <Redirect to="/user-admin/list" />
        }
        <header className="app-header">
          <img src={matrixLogo} className="app-logo" alt="logo" />
          <h1 className="app-title">Welcome to Synapse Admin</h1>
        </header>
        <form className="app-login" onSubmit={this.handleSubmit}>
          <div>
            <TextField error={submitted && !homeserver}
              label="Homeserver" name="homeserver"
              value={homeserver} onChange={this.handleChange}
              variant="filled" margin="normal"
              helperText={submitted && !homeserver && 'Homeserver is required'} />
          </div>
          <div>
            <TextField error={submitted && !username}
              label="Username" name="username"
              value={username} onChange={this.handleChange}
              variant="filled" margin="normal"
              helperText={submitted && !username && 'Username is required'} />
          </div>
          <div>
            <TextField error={submitted && !password}
              label="Password" type="password" name="password"
              value={password} onChange={this.handleChange}
              variant="filled" margin="normal"
              helperText={submitted && !password && 'Password is required'} />
          </div>
          <div className="button">
            <Button type="submit" variant="contained" color="primary">
              Login
            </Button>
            {loginPending &&
              <img alt="logging in" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
            }
          </div>
        </form>
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    mtx: state.common.mtx,
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
