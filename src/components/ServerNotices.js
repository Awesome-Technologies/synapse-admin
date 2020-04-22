import React, { Fragment, useState } from "react";
import MessageIcon from "@material-ui/icons/Message";
import IconCancel from "@material-ui/icons/Cancel";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import {
  TextInput,
  SaveButton,
  useTranslate,
  Button,
  useNotify,
  useUnselectAll,
  required,
  Toolbar,
  SimpleForm,
  useMutation,
} from "react-admin";

const ServerNoticesButton = ({ record, selectedIds }) => {
  const [open, setOpen] = useState(false);
  const notify = useNotify();
  const unselectAll = useUnselectAll();
  const translate = useTranslate();
  const handleDialogOpen = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);
  const [mutate, { loading }] = useMutation();
  const handleConfirm = values => {
    if (Array.isArray(selectedIds)) {
      mutate(
        {
          type: "sendMessageMany",
          resource: "servernotices",
          payload: { ids: selectedIds, data: values },
        },
        {
          onSuccess: ({ data }) => {
            notify("resources.servernotices.action.send_success");
            unselectAll("users");
          },
          onFailure: error =>
            notify("resources.servernotices.action.send_failure", "error"),
        }
      );
    } else {
      mutate(
        {
          type: "sendMessage",
          resource: "servernotices",
          payload: { id: record.id, data: values },
        },
        {
          onSuccess: ({ data }) =>
            notify("resources.servernotices.action.send_success"),
          onFailure: error =>
            notify("resources.servernotices.action.send_failure", "error"),
        }
      );
    }
    handleDialogClose();
  };

  const ServernoticesToolbar = props => (
    <Toolbar {...props}>
      <SaveButton label="resources.servernotices.action.send" />
      <Button label="ra.action.cancel" onClick={handleDialogClose}>
        <IconCancel />
      </Button>
    </Toolbar>
  );

  return (
    <Fragment>
      <Button label="resources.servernotices.send" onClick={handleDialogOpen}>
        <MessageIcon />
      </Button>
      <Dialog open={open} onClose={handleDialogClose} loading={loading}>
        <DialogTitle>
          {translate("resources.servernotices.action.send")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {translate("resources.servernotices.helper.send")}
          </DialogContentText>
          <SimpleForm
            toolbar={<ServernoticesToolbar />}
            submitOnEnter={false}
            redirect={false}
            save={handleConfirm}
          >
            <TextInput
              source="body"
              label="resources.servernotices.fields.body"
              multiline
              resettable
              validate={required()}
            />
          </SimpleForm>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default ServerNoticesButton;
