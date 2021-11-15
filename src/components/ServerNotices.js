import React, { Fragment, useState } from "react";
import {
  Button,
  SaveButton,
  SimpleForm,
  TextInput,
  Toolbar,
  required,
  useCreate,
  useMutation,
  useNotify,
  useTranslate,
  useUnselectAll,
} from "react-admin";
import MessageIcon from "@material-ui/icons/Message";
import IconCancel from "@material-ui/icons/Cancel";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

const ServerNoticeDialog = ({ open, loading, onClose, onSend }) => {
  const translate = useTranslate();

  const ServerNoticeToolbar = props => (
    <Toolbar {...props}>
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
        <SimpleForm
          toolbar={<ServerNoticeToolbar />}
          submitOnEnter={false}
          redirect={false}
          save={onSend}
        >
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

export const ServerNoticeButton = ({ record }) => {
  const [open, setOpen] = useState(false);
  const notify = useNotify();
  const [create, { loading }] = useCreate("servernotices");

  const handleDialogOpen = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);

  const handleSend = values => {
    create(
      { payload: { data: { id: record.id, ...values } } },
      {
        onSuccess: () => {
          notify("resources.servernotices.action.send_success");
          handleDialogClose();
        },
        onFailure: () =>
          notify("resources.servernotices.action.send_failure", "error"),
      }
    );
  };

  return (
    <Fragment>
      <Button
        label="resources.servernotices.send"
        onClick={handleDialogOpen}
        disabled={loading}
      >
        <MessageIcon />
      </Button>
      <ServerNoticeDialog
        open={open}
        onClose={handleDialogClose}
        onSend={handleSend}
      />
    </Fragment>
  );
};

export const ServerNoticeBulkButton = ({ selectedIds }) => {
  const [open, setOpen] = useState(false);
  const notify = useNotify();
  const unselectAll = useUnselectAll();
  const [createMany, { loading }] = useMutation();

  const handleDialogOpen = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);

  const handleSend = values => {
    createMany(
      {
        type: "createMany",
        resource: "servernotices",
        payload: { ids: selectedIds, data: values },
      },
      {
        onSuccess: ({ data }) => {
          notify("resources.servernotices.action.send_success");
          unselectAll("users");
          handleDialogClose();
        },
        onFailure: error =>
          notify("resources.servernotices.action.send_failure", "error"),
      }
    );
  };

  return (
    <Fragment>
      <Button
        label="resources.servernotices.send"
        onClick={handleDialogOpen}
        disabled={loading}
      >
        <MessageIcon />
      </Button>
      <ServerNoticeDialog
        open={open}
        onClose={handleDialogClose}
        onSend={handleSend}
      />
    </Fragment>
  );
};
