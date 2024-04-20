import React, { useState } from "react";
import get from "lodash/get";
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
  useRecordContext,
  useRefresh,
  useTranslate,
} from "react-admin";
import { Link } from "react-router-dom";
import BlockIcon from "@mui/icons-material/Block";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import {
  Box,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
} from "@mui/material";
import IconCancel from "@mui/icons-material/Cancel";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import { alpha, useTheme } from "@mui/material/styles";
import { getMediaUrl } from "../synapse/synapse";

const DeleteMediaDialog = ({ open, loading, onClose, onSubmit }) => {
  const translate = useTranslate();

  const dateParser = v => {
    const d = new Date(v);
    if (isNaN(d)) return 0;
    return d.getTime();
  };

  const DeleteMediaToolbar = props => (
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

  return (
    <Dialog open={open} onClose={onClose} loading={loading}>
      <DialogTitle>
        {translate("resources.delete_media.action.send")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {translate("resources.delete_media.helper.send")}
        </DialogContentText>
        <SimpleForm toolbar={<DeleteMediaToolbar />} onSubmit={onSubmit}>
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
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const notify = useNotify();
  const [deleteOne, { isLoading }] = useDelete();

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  const deleteMedia = values => {
    deleteOne(
      "delete_media",
      // needs meta.before_ts, meta.size_gt and meta.keep_profiles
      { meta: values },
      {
        onSuccess: () => {
          notify("resources.delete_media.action.send_success");
          closeDialog();
        },
        onError: () =>
          notify("resources.delete_media.action.send_failure", {
            type: "error",
          }),
      }
    );
  };

  return (
    <>
      <Button
        {...props}
        label="resources.delete_media.action.send"
        onClick={openDialog}
        disabled={isLoading}
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
        <DeleteSweepIcon />
      </Button>
      <DeleteMediaDialog
        open={open}
        onClose={closeDialog}
        onSubmit={deleteMedia}
      />
    </>
  );
};

export const ProtectMediaButton = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  const refresh = useRefresh();
  const notify = useNotify();
  const [create, { isLoading }] = useCreate();
  const [deleteOne] = useDelete();

  if (!record) return null;

  const handleProtect = () => {
    create(
      "protect_media",
      { data: record },
      {
        onSuccess: () => {
          notify("resources.protect_media.action.send_success");
          refresh();
        },
        onError: () =>
          notify("resources.protect_media.action.send_failure", {
            type: "error",
          }),
      }
    );
  };

  const handleUnprotect = () => {
    deleteOne(
      "protect_media",
      { id: record.id },
      {
        onSuccess: () => {
          notify("resources.protect_media.action.send_success");
          refresh();
        },
        onError: () =>
          notify("resources.protect_media.action.send_failure", {
            type: "error",
          }),
      }
    );
  };

  return (
    /*
    Wrapping Tooltip with <div>
    https://github.com/marmelab/react-admin/issues/4349#issuecomment-578594735
    */
    <>
      {record.quarantined_by && (
        <Tooltip
          title={translate("resources.protect_media.action.none", {
            _: "resources.protect_media.action.none",
          })}
        >
          <div>
            {/*
            Button instead BooleanField for
            consistent appearance and position in the column
            */}
            <Button disabled={true}>
              <ClearIcon />
            </Button>
          </div>
        </Tooltip>
      )}
      {record.safe_from_quarantine && (
        <Tooltip
          title={translate("resources.protect_media.action.delete", {
            _: "resources.protect_media.action.delete",
          })}
          arrow
        >
          <div>
            <Button onClick={handleUnprotect} disabled={isLoading}>
              <LockIcon />
            </Button>
          </div>
        </Tooltip>
      )}
      {!record.safe_from_quarantine && !record.quarantined_by && (
        <Tooltip
          title={translate("resources.protect_media.action.create", {
            _: "resources.protect_media.action.create",
          })}
        >
          <div>
            <Button onClick={handleProtect} disabled={isLoading}>
              <LockOpenIcon />
            </Button>
          </div>
        </Tooltip>
      )}
    </>
  );
};

export const QuarantineMediaButton = props => {
  const record = useRecordContext();
  const translate = useTranslate();
  const refresh = useRefresh();
  const notify = useNotify();
  const [create, { isLoading }] = useCreate();
  const [deleteOne] = useDelete();

  if (!record) return null;

  const handleQuarantaine = () => {
    create(
      "quarantine_media",
      { data: record },
      {
        onSuccess: () => {
          notify("resources.quarantine_media.action.send_success");
          refresh();
        },
        onError: () =>
          notify("resources.quarantine_media.action.send_failure", {
            type: "error",
          }),
      }
    );
  };

  const handleRemoveQuarantaine = () => {
    deleteOne(
      "quarantine_media",
      { id: record.id, previousData: record },
      {
        onSuccess: () => {
          notify("resources.quarantine_media.action.send_success");
          refresh();
        },
        onError: () =>
          notify("resources.quarantine_media.action.send_failure", {
            type: "error",
          }),
      }
    );
  };

  return (
    <>
      {record.safe_from_quarantine && (
        <Tooltip
          title={translate("resources.quarantine_media.action.none", {
            _: "resources.quarantine_media.action.none",
          })}
        >
          <div>
            <Button {...props} disabled={true}>
              <ClearIcon />
            </Button>
          </div>
        </Tooltip>
      )}
      {record.quarantined_by && (
        <Tooltip
          title={translate("resources.quarantine_media.action.delete", {
            _: "resources.quarantine_media.action.delete",
          })}
        >
          <div>
            <Button
              {...props}
              onClick={handleRemoveQuarantaine}
              disabled={isLoading}
            >
              <BlockIcon color="error" />
            </Button>
          </div>
        </Tooltip>
      )}
      {!record.safe_from_quarantine && !record.quarantined_by && (
        <Tooltip
          title={translate("resources.quarantine_media.action.create", {
            _: "resources.quarantine_media.action.create",
          })}
        >
          <div>
            <Button onClick={handleQuarantaine} disabled={isLoading}>
              <BlockIcon />
            </Button>
          </div>
        </Tooltip>
      )}
    </>
  );
};

export const ViewMediaButton = ({ media_id, label }) => {
  const translate = useTranslate();
  const url = getMediaUrl(media_id);
  return (
    <Box style={{ whiteSpace: "pre" }}>
      <Tooltip title={translate("resources.users_media.action.open")}>
        <span>
          <Button
            component={Link}
            to={url}
            target="_blank"
            rel="noopener"
            style={{ minWidth: 0, paddingLeft: 0, paddingRight: 0 }}
          >
            <FileOpenIcon />
          </Button>
        </span>
      </Tooltip>
      {label}
    </Box>
  );
};

export const MediaIDField = ({ source }) => {
  const homeserver = localStorage.getItem("home_server");
  const record = useRecordContext();
  if (!record) return null;

  const src = get(record, source)?.toString();
  if (!src) return null;

  return <ViewMediaButton media_id={`${homeserver}/${src}`} label={src} />;
};

export const MXCField = ({ source }) => {
  const record = useRecordContext();
  if (!record) return null;

  const src = get(record, source)?.toString();
  if (!src) return null;

  const media_id = src.replace("mxc://", "");

  return <ViewMediaButton media_id={media_id} label={src} />;
};
