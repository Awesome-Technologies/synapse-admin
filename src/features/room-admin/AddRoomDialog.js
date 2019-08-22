import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { Button, Checkbox, CircularProgress, FormControlLabel, TextField } from '@material-ui/core';
import * as actions from './redux/actions';

export class AddRoomDialog extends Component {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    roomAdmin: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      is_public: false,
      is_federated: false,
      room_alias_name: '',
      name: '',
      topic: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleCheckbox = this.handleCheckbox.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    if (this.props.roomAdmin.createRoomError) this.props.actions.dismissCreateRoomError();
  }

  componentDidUpdate(prevProps) {
    if (!this.props.roomAdmin.createRoomError
      && prevProps.roomAdmin.createRoomPending
      && !this.props.roomAdmin.createRoomPending) {
      this.props.onClose();
    }
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
    if (this.props.roomAdmin.createRoomError) this.props.actions.dismissCreateRoomError();
  }

  handleCheckbox(e) {
    const { name, checked } = e.target;
    this.setState({ [name]: checked });
    if (this.props.roomAdmin.createRoomError) this.props.actions.dismissCreateRoomError();
  }

  handleSubmit(e) {
    e.preventDefault();
    const { is_public, is_federated } = this.state;
    var creation_content = {};
    creation_content['m.federate'] = is_federated;
    this.setState({
      visibility: is_public ? 'public' : 'private',
      creation_content: creation_content,
    });
    this.props.actions.createRoom(this.state)
  }

  render() {
    const { open, onClose } = this.props;
    const { createRoomPending, createRoomError } = this.props.roomAdmin;
    return (
      <Dialog className="room-admin-add-room-dialog" open={open} onClose={onClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Add Room</DialogTitle>
        <DialogContent>
          {createRoomError && <DialogContentText color="error">{createRoomError.message}</DialogContentText>}
          <form className="app-login" onSubmit={this.handleSubmit}>
            <div>
              <FormControlLabel
                label="Public"
                name="is_public"
                onChange={this.handleCheckbox}
                control={<Checkbox color="primary" />}
                margin="dense"
                labelPlacement="start"
              />
              <FormControlLabel
                label="Federated"
                name="is_federated"
                onChange={this.handleCheckbox}
                control={<Checkbox color="primary" />}
                margin="dense"
                labelPlacement="start"
              />
            </div>
            <div><TextField label="Alias" name="room_alias_name" onChange={this.handleChange} margin="dense" autoFocus /></div>
            <div><TextField label="Name" name="name" onChange={this.handleChange} margin="dense" /></div>
            <div><TextField label="Topic" name="topic" onChange={this.handleChange} margin="dense" /></div>
            {createRoomPending ?
              (<CircularProgress size={24} className="buttonProgress" />) :
              (<DialogActions className="button">
                <Button variant="outlined" color="primary" margin="normal" onClick={onClose}>Cancel</Button>
                <Button variant="contained" color="primary" margin="normal" type="submit">Create</Button>
              </DialogActions>)
            }
          </form>
        </DialogContent>
      </Dialog>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
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
)(AddRoomDialog);
