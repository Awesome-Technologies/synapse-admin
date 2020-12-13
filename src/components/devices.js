import React, { Fragment, useState } from "react";
import {
  Button,
  useMutation,
  useNotify,
  Confirm,
  useRefresh,
} from "react-admin";
import ActionDelete from "@material-ui/icons/Delete";
import { makeStyles } from "@material-ui/core/styles";
import { fade } from "@material-ui/core/styles/colorManipulator";
import classnames from "classnames";

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

export const DeviceRemoveButton = props => {
  const { record } = props;
  const classes = useStyles(props);
  const [open, setOpen] = useState(false);
  const refresh = useRefresh();
  const notify = useNotify();

  const [removeDevice, { loading }] = useMutation();

  if (!record) return null;

  const handleClick = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);

  const handleConfirm = () => {
    removeDevice(
      {
        type: "delete",
        resource: "devices",
        payload: {
          id: record.id,
          user_id: record.user_id,
        },
      },
      {
        onSuccess: () => {
          notify("resources.devices.action.erase.success");
          refresh();
        },
        onFailure: () =>
          notify("resources.devices.action.erase.failure", "error"),
      }
    );
    setOpen(false);
  };

  return (
    <Fragment>
      <Button
        label="ra.action.remove"
        onClick={handleClick}
        className={classnames("ra-delete-button", classes.deleteButton)}
      >
        <ActionDelete />
      </Button>
      <Confirm
        isOpen={open}
        loading={loading}
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
        title="resources.devices.action.erase.title"
        content="resources.devices.action.erase.content"
        translateOptions={{
          id: record.id,
          name: record.display_name ? record.display_name : record.id,
        }}
      />
    </Fragment>
  );
};
