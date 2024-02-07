import React, { useState } from "react";
import {
  Button,
  useDelete,
  useNotify,
  Confirm,
  useRecordContext,
  useRefresh,
} from "react-admin";
import ActionDelete from "@mui/icons-material/Delete";
import { alpha, useTheme } from "@mui/material/styles";

export const DeviceRemoveButton = props => {
  const theme = useTheme();
  const record = useRecordContext();
  const [open, setOpen] = useState(false);
  const refresh = useRefresh();
  const notify = useNotify();

  const [removeDevice, { isLoading }] = useDelete();

  if (!record) return null;

  const handleClick = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);

  const handleConfirm = () => {
    removeDevice(
      "devices",
      // needs previousData for user_id
      { id: record.id, previousData: record },
      {
        onSuccess: () => {
          notify("resources.devices.action.erase.success");
          refresh();
        },
        onError: () => {
          notify("resources.devices.action.erase.failure", { type: "error" });
        },
      }
    );
    setOpen(false);
  };

  return (
    <>
      <Button
        {...props}
        label="ra.action.remove"
        onClick={handleClick}
        sx={{
          color: theme.palette.error.main,
          "&:hover": {
            backgroundColor: alpha(theme.palette.error.main, 0.12),
            // Reset on mouse devices
            "@media (hover: none)": {
              backgroundColor: "transparent",
            },
          },
        }}
      >
        <ActionDelete />
      </Button>
      <Confirm
        isOpen={open}
        loading={isLoading}
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
        title="resources.devices.action.erase.title"
        content="resources.devices.action.erase.content"
        translateOptions={{
          id: record.id,
          name: record.display_name ? record.display_name : record.id,
        }}
      />
    </>
  );
};
