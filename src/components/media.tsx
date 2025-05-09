import { get } from "lodash";
import { useState } from "react";

import BlockIcon from "@mui/icons-material/Block";
import IconCancel from "@mui/icons-material/Cancel";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { Box, Dialog, DialogContent, DialogContentText, DialogTitle, Tooltip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  BooleanInput,
  Button,
  ButtonProps,
  DateTimeInput,
  NumberInput,
  SaveButton,
  SimpleForm,
  Toolbar,
  ToolbarProps,
  useCreate,
  useDataProvider,
  useDelete,
  useNotify,
  useRecordContext,
  useRefresh,
  useTranslate,
} from "react-admin";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { dateParser } from "./date";
import { DeleteMediaParams, SynapseDataProvider } from "../synapse/dataProvider";
import { getMediaUrl } from "../synapse/synapse";
import storage from "../storage";

const DeleteMediaDialog = ({ open, onClose, onSubmit }) => {
  const translate = useTranslate();

  const DeleteMediaToolbar = (props: ToolbarProps) => (
    <Toolbar {...props}>
      <SaveButton label="delete_media.action.send" icon={<DeleteSweepIcon />} />
      <Button label="ra.action.cancel" onClick={onClose}>
        <IconCancel />
      </Button>
    </Toolbar>
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{translate("delete_media.action.send")}</DialogTitle>
      <DialogContent>
        <DialogContentText>{translate("delete_media.helper.send")}</DialogContentText>
        <SimpleForm toolbar={<DeleteMediaToolbar />} onSubmit={onSubmit}>
          <DateTimeInput
            source="before_ts"
            label="delete_media.fields.before_ts"
            defaultValue={0}
            parse={dateParser}
          />
          <NumberInput
            source="size_gt"
            label="delete_media.fields.size_gt"
            defaultValue={0}
            min={0}
            step={1024}
          />
          <BooleanInput
            source="keep_profiles"
            label="delete_media.fields.keep_profiles"
            defaultValue={true}
          />
        </SimpleForm>
      </DialogContent>
    </Dialog>
  );
};

export const DeleteMediaButton = (props: ButtonProps) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const notify = useNotify();
  const dataProvider = useDataProvider<SynapseDataProvider>();
  const { mutate: deleteMedia, isPending } = useMutation({
    mutationFn: (values: DeleteMediaParams) => dataProvider.deleteMedia(values),
    onSuccess: () => {
      notify("delete_media.action.send_success");
      closeDialog();
    },
    onError: () => {
      notify("delete_media.action.send_failure", {
        type: "error",
      });
    },
  });

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  return (
    <>
      <Button
        {...props}
        label="delete_media.action.send"
        onClick={openDialog}
        disabled={isPending}
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
      <DeleteMediaDialog open={open} onClose={closeDialog} onSubmit={deleteMedia} />
    </>
  );
};

export const ProtectMediaButton = (props: ButtonProps) => {
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
            <Button {...props} disabled={true}>
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
            <Button {...props} onClick={handleUnprotect} disabled={isLoading}>
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
            <Button {...props} onClick={handleProtect} disabled={isLoading}>
              <LockOpenIcon />
            </Button>
          </div>
        </Tooltip>
      )}
    </>
  );
};

export const QuarantineMediaButton = (props: ButtonProps) => {
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
            <Button {...props} onClick={handleRemoveQuarantaine} disabled={isLoading}>
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
            <Button {...props} onClick={handleQuarantaine} disabled={isLoading}>
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
  const homeserver = storage.getItem("home_server");
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
