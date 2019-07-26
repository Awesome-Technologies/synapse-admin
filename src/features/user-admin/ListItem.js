import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Avatar, TableCell, TableRow } from '@material-ui/core';
import * as actions from './redux/actions';

export class ListItem extends Component {
  static propTypes = {
    mtx: PropTypes.object.isRequired,
    userAdmin: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    is_guest: PropTypes.bool,
    is_admin: PropTypes.bool,
  };

  componentDidMount() {
    const { fetchProfile } = this.props.actions;
    const { name } = this.props;
    fetchProfile(name);
  }

  render() {
    const { name, is_guest, is_admin } = this.props;
    const { userProfiles } = this.props.userAdmin;
    var profile = {};
    if (name in userProfiles) {
      profile = userProfiles[name];
    }
    // create url for showing avatar image
    var avatar_src = "";
    if ( typeof profile.avatar_url !== 'undefined') {
        // mxc://serverName/mediaId
        var res = profile.avatar_url.split("/");
        var serverName = res[2];
        var mediaId = res[3];
        avatar_src = "https://" + serverName + "/_matrix/media/r0/thumbnail/" + serverName + "/" + mediaId + "?width=36&amp;height=36&amp;method=crop";
    }
    return (
      <TableRow hover>
        <TableCell padding="none"><Avatar src={avatar_src} alt={profile.displayname} /></TableCell>
        <TableCell>{profile.displayname}</TableCell>
        <TableCell>{name}</TableCell>
        <TableCell>{is_guest ? 'X' : ''}</TableCell>
        <TableCell>{is_admin ? 'X' : ''}</TableCell>
      </TableRow>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    mtx: state.common.mtx,
    userAdmin: state.userAdmin,
  };
}

/* istanbul ignore next */
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...actions }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ListItem);
