import React, { Fragment, useState } from "react";
import {
  Button,
  SaveButton,
  SimpleForm,
  TextInput,
  Toolbar,
  required,
  useCreate,
  useDataProvider,
  useListContext,
  useNotify,
  useRecordContext,
  useTranslate,
  useUnselectAll,
} from "react-admin";
import { useMutation } from "react-query";
import MessageIcon from "@mui/icons-material/Message";
import IconCancel from "@mui/icons-material/Cancel";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

const ServerNoticeDialog = ({ open, loading, onClose, onSubmit }) => {
  const translate = useTranslate();

  const ServerNoticeToolbar = props => (
    <Toolbar>
      <SaveButton
        label="resources.servernotices.action.send"
        disabled={props.pristine}
      />
      <Button label="ra.action.cancel" onClick={onClose}>
        <IconCancel />
      </Button>
    </Toolbar>
  );

  return (
    <Dialog open={open} onClose={onClose} loading={loading}>
      <DialogTitle>
        {translate("resources.servernotices.action.send")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {translate("resources.servernotices.helper.send")}
        </DialogContentText>
        <SimpleForm toolbar={<ServerNoticeToolbar />} onSubmit={onSubmit}>
          <TextInput
            source="body"
            label="resources.servernotices.fields.body"
            fullWidth
            multiline
            rows="4"
            resettable
            validate={required()}
          />
        </SimpleForm>
      </DialogContent>
    </Dialog>
  );
};

export const ServerNoticeButton = () => {
  const record = useRecordContext();
  const [open, setOpen] = useState(false);
  const notify = useNotify();
  const [create, { isloading }] = useCreate();

  const handleDialogOpen = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);

  const handleSend = values => {
    create(
      "servernotices",
      { data: { id: record.id, ...values } },
      {
        onSuccess: () => {
          notify("resources.servernotices.action.send_success");
          handleDialogClose();
        },
        onError: () =>
          notify("resources.servernotices.action.send_failure", {
            type: "error",
          }),
      }
    );
  };

  return (
    <Fragment>
      <Button
        label="resources.servernotices.send"
        onClick={handleDialogOpen}
        disabled={isloading}
      >
        <MessageIcon />
      </Button>
      <ServerNoticeDialog
        open={open}
        onClose={handleDialogClose}
        onSubmit={handleSend}
      />
    </Fragment>
  );
};

export const ServerNoticeBulkButton = () => {
  const { selectedIds } = useListContext();
  const [open, setOpen] = useState(false);
  const handleDialogOpen = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);
  const notify = useNotify();
  const unselectAll = useUnselectAll("users");
  const dataProvider = useDataProvider();

  const { mutate, isloading } = useMutation(
    data =>
      dataProvider.createMany("servernotices", {
        ids: selectedIds,
        data: data,
      }),
    {
      onSuccess: () => {
        notify("resources.servernotices.action.send_success");
        unselectAll();
        handleDialogClose();
      },
      onError: () =>
        notify("resources.servernotices.action.send_failure", {
          type: "error",
        }),
    }
  );

  return (
    <Fragment>
      <Button
        label="resources.servernotices.send"
        onClick={handleDialogOpen}
        disabled={isloading}
      >
        <MessageIcon />
      </Button>
      <ServerNoticeDialog
        open={open}
        onClose={handleDialogClose}
        onSubmit={mutate}
      />
    </Fragment>
  );
};
