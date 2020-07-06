import React, { Fragment, useState } from "react";
import {
  Button,
  useMutation,
  useNotify,
  useTranslate,
  Confirm,
  useRefresh,
} from "react-admin";
import ActionDelete from "@material-ui/icons/Delete";
import { makeStyles } from "@material-ui/core/styles";
import { fade } from "@material-ui/core/styles/colorManipulator";
import classnames from "classnames";

export const RemoveDeviceButton = props => {
  const { record } = props;
  const classes = useStyles(props);
  const [open, setOpen] = useState(false);
  const translate = useTranslate();
  const refresh = useRefresh();
  const notify = useNotify();

  const [removeDevice, { loading }] = useMutation();
  const handleSend = values => {
    removeDevice(
      {
        type: "removeDevice",
        resource: "devices",
        payload: {
          user_id: record.user_id,
          device_id: record.device_id,
        },
      },
      {
        onSuccess: () => {
          notify("resources.devices.action.remove_success");
          refresh();
        },
        onFailure: () =>
          notify("resources.devices.action.remove_failure", "error"),
      }
    );
  };

  const handleClick = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);

  const handleConfirm = () => {
    handleSend();
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
        title="resources.devices.action.remove_title"
        content="resources.devices.action.remove_content"
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
        translateOptions={{
          name: translate(`resources.devices.name`, {
            smart_count: 1,
          }),
          display_name: translate(`resources.devices.fields.display_name`),
          id: record.device_id,
          displayname: record.display_name,
        }}
      />
    </Fragment>
  );
};

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
