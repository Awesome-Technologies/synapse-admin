import React, { Fragment, useState } from "react";
import classnames from "classnames";
import { fade } from "@material-ui/core/styles/colorManipulator";
import {
  useTranslate,
  useRedirect,
  Toolbar,
  SaveButton,
  Button,
  SimpleForm,
  BooleanInput,
  useRecordContext,
  useDelete,
  useNotify,
} from "react-admin";
import { makeStyles } from "@material-ui/core/styles";
import IconCancel from "@material-ui/icons/Cancel";
import DeleteIcon from "@material-ui/icons/Delete";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const useStyles = makeStyles(theme => ({
  helper_forward_extremities: {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    margin: "0.5em",
  },
  deleteButton: {
    color: theme.palette.error.main,
    "&:hover": {
      backgroundColor: fade(theme.palette.error.main, 0.12),
      // Reset on mouse devices
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
  },
}));

export const DeleteRoomDialog = ({ open, loading, onClose, onSend }) => {
  const translate = useTranslate();

  const DeleteRoomToolbar = props => {
    return (
      <Toolbar {...props}>
        <SaveButton
          label="resources.rooms.action.erase.title"
          icon={<DeleteIcon />}
        />
        <Button label="ra.action.cancel" onClick={onClose}>
          <IconCancel />
        </Button>
      </Toolbar>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} loading={loading}>
      <DialogTitle>
        {translate("resources.rooms.action.erase.title")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {translate("resources.rooms.action.erase.content")}
        </DialogContentText>
        <SimpleForm
          toolbar={<DeleteRoomToolbar />}
          submitOnEnter={false}
          redirect={false}
          save={onSend}
        >
          <BooleanInput
            fullWidth
            source="block"
            label="resources.rooms.action.erase.fields.block"
            defaultValue={true}
          />
        </SimpleForm>
      </DialogContent>
    </Dialog>
  );
};

export const DeleteRoomButton = props => {
  const classes = useStyles(props);
  const [open, setOpen] = useState(false);
  const notify = useNotify();
  const redirect = useRedirect();
  const [deleteOne, { loading }] = useDelete("rooms");
  const record = useRecordContext(props);

  const handleDialogOpen = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);

  const handleSend = values => {
    deleteOne(
      { payload: { id: record.id, ...values } },
      {
        onSuccess: () => {
          notify("resources.rooms.action.erase.send_success");
          handleDialogClose();
          redirect("/rooms");
        },
        onFailure: () =>
          notify("resources.rooms.action.erase.send_failure", "error"),
      }
    );
  };

  return (
    <Fragment>
      <Button
        label="resources.rooms.action.erase.title"
        onClick={handleDialogOpen}
        disabled={loading}
        className={classnames("ra-delete-button", classes.deleteButton)}
      >
        <DeleteIcon />
      </Button>
      <DeleteRoomDialog
        open={open}
        onClose={handleDialogClose}
        onSend={handleSend}
      />
    </Fragment>
  );
};
