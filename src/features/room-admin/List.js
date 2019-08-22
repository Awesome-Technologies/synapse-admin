import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';
import { Fab, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import AddRoomDialog from './AddRoomDialog';
import * as actions from './redux/actions';

const styles = theme => ({
  fab: {
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
  },
});

export class List extends Component {
  static propTypes = {
    roomAdmin: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      addRoomDialogOpen: false,
    };
  }

  componentDidMount() {
    this.props.actions.fetchPublicRooms();
  }

  handleOpenAddDialog = () => {
    this.setState({ addRoomDialogOpen: true });
  };

  handleCloseAddDialog = () => {
    this.setState({ addRoomDialogOpen: false });
    this.props.actions.fetchPublicRooms();
  };

  render() {
    const { classes, mtx } = this.props;
    const { roomList, fetchRoomsPending } = this.props.roomAdmin;
    const { addRoomDialogOpen } = this.state;
    return (
      <div className="room-admin-list">
        {(!mtx || !mtx.clientRunning) && <Redirect to="/" />}
        {fetchRoomsPending && <img alt="logging in" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />}
        <Fab color="primary" className={classes.fab} onClick={this.handleOpenAddDialog}><AddIcon /></Fab>
        <AddRoomDialog open={addRoomDialogOpen} onClose={this.handleCloseAddDialog} />
        <Table className="room-list">
          <TableHead>
            <TableRow>
              <TableCell>Alias</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Topic</TableCell>
              <TableCell>Room-ID</TableCell>
              <TableCell>Members</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roomList.map(item => (<TableRow key={item.room_id}>
              <TableCell>{item.canonical_alias}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.topic}</TableCell>
              <TableCell>{item.room_id}</TableCell>
              <TableCell>{item.num_joined_members}</TableCell>
            </TableRow>))}
          </TableBody>
        </Table>
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    mtx: state.common.mtx,
    roomAdmin: state.roomAdmin,
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
)(withStyles(styles, { withTheme: true })(List));
