import React, { Fragment, useState } from "react";
import classnames from "classnames";
import { fade } from "@material-ui/core/styles/colorManipulator";
import { makeStyles } from "@material-ui/core/styles";
import {
  BooleanInput,
  Button,
  DateTimeInput,
  NumberInput,
  SaveButton,
  SimpleForm,
  Toolbar,
  useCreate,
  useDelete,
  useNotify,
  useRefresh,
  useTranslate,
} from "react-admin";
import DeleteSweepIcon from "@material-ui/icons/DeleteSweep";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconCancel from "@material-ui/icons/Cancel";
import LockIcon from "@material-ui/icons/Lock";
import LockOpenIcon from "@material-ui/icons/LockOpen";

const useStyles = makeStyles(
  theme => ({
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
  }),
  { name: "RaDeleteDeviceButton" }
);

const DeleteMediaDialog = ({ open, loading, onClose, onSend }) => {
  const translate = useTranslate();

  const dateParser = v => {
    const d = new Date(v);
    if (isNaN(d)) return 0;
    return d.getTime();
  };

  const DeleteMediaToolbar = props => {
    return (
      <Toolbar {...props}>
        <SaveButton
          label="resources.delete_media.action.send"
          icon={<DeleteSweepIcon />}
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
        {translate("resources.delete_media.action.send")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {translate("resources.delete_media.helper.send")}
        </DialogContentText>
        <SimpleForm
          toolbar={<DeleteMediaToolbar />}
          submitOnEnter={false}
          redirect={false}
          save={onSend}
        >
          <DateTimeInput
            fullWidth
            source="before_ts"
            label="resources.delete_media.fields.before_ts"
            defaultValue={0}
            parse={dateParser}
          />
          <NumberInput
            fullWidth
            source="size_gt"
            label="resources.delete_media.fields.size_gt"
            defaultValue={0}
            min={0}
            step={1024}
          />
          <BooleanInput
            fullWidth
            source="keep_profiles"
            label="resources.delete_media.fields.keep_profiles"
            defaultValue={true}
          />
        </SimpleForm>
      </DialogContent>
    </Dialog>
  );
};

export const DeleteMediaButton = props => {
  const classes = useStyles(props);
  const [open, setOpen] = useState(false);
  const notify = useNotify();
  const [deleteOne, { loading }] = useDelete("delete_media");

  const handleDialogOpen = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);

  const handleSend = values => {
    deleteOne(
      { payload: { ...values } },
      {
        onSuccess: () => {
          notify("resources.delete_media.action.send_success");
          handleDialogClose();
        },
        onFailure: () =>
          notify("resources.delete_media.action.send_failure", "error"),
      }
    );
  };

  return (
    <Fragment>
      <Button
        label="resources.delete_media.action.send"
        onClick={handleDialogOpen}
        disabled={loading}
        className={classnames("ra-delete-button", classes.deleteButton)}
      >
        <DeleteSweepIcon />
      </Button>
      <DeleteMediaDialog
        open={open}
        onClose={handleDialogClose}
        onSend={handleSend}
      />
    </Fragment>
  );
};

export const ProtectMediaButton = props => {
  const { record } = props;
  const refresh = useRefresh();
  const notify = useNotify();
  const [create, { loading }] = useCreate("protect_media");
  const [deleteOne] = useDelete("protect_media");

  if (!record) return null;

  const handleProtect = () => {
    create(
      { payload: { data: record } },
      {
        onSuccess: () => {
          notify("resources.protect_media.action.send_success");
          refresh();
        },
        onFailure: () =>
          notify("resources.protect_media.action.send_failure", "error"),
      }
    );
  };

  const handleUnprotect = () => {
    deleteOne(
      { payload: { ...record } },
      {
        onSuccess: () => {
          notify("resources.protect_media.action.send_success");
          refresh();
        },
        onFailure: () =>
          notify("resources.protect_media.action.send_failure", "error"),
      }
    );
  };

  return (
    <Fragment>
      {!record.safe_from_quarantine && !record.quarantined_by && (
        <Button
          label="resources.protect_media.action.create"
          onClick={handleProtect}
          disabled={loading}
        >
          <LockIcon />
        </Button>
      )}
      {record.safe_from_quarantine && (
        <Button
          label="resources.protect_media.action.delete"
          onClick={handleUnprotect}
          disabled={loading}
        >
          <LockOpenIcon />
        </Button>
      )}
    </Fragment>
  );
};
