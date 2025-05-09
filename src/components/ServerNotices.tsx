import { useState } from "react";

import IconCancel from "@mui/icons-material/Cancel";
import MessageIcon from "@mui/icons-material/Message";
import { Dialog, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import {
  Button,
  RaRecord,
  SaveButton,
  SimpleForm,
  TextInput,
  Toolbar,
  ToolbarProps,
  required,
  useCreate,
  useDataProvider,
  useListContext,
  useNotify,
  useRecordContext,
  useTranslate,
  useUnselectAll,
} from "react-admin";
import { useMutation } from "@tanstack/react-query";

const ServerNoticeDialog = ({ open, onClose, onSubmit }) => {
  const translate = useTranslate();

  const ServerNoticeToolbar = (props: ToolbarProps & { pristine?: boolean }) => (
    <Toolbar {...props}>
      <SaveButton label="resources.servernotices.action.send" disabled={props.pristine} />
      <Button label="ra.action.cancel" onClick={onClose}>
        <IconCancel />
      </Button>
    </Toolbar>
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{translate("resources.servernotices.action.send")}</DialogTitle>
      <DialogContent>
        <DialogContentText>{translate("resources.servernotices.helper.send")}</DialogContentText>
        <SimpleForm toolbar={<ServerNoticeToolbar />} onSubmit={onSubmit}>
          <TextInput
            source="body"
            label="resources.servernotices.fields.body"
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
  const [create, { isLoading }] = useCreate();

  const handleDialogOpen = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);

  if (!record) {
    return;
  }

  const handleSend = (values: Partial<RaRecord>) => {
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
    <>
      <Button label="resources.servernotices.send" onClick={handleDialogOpen} disabled={isLoading}>
        <MessageIcon />
      </Button>
      <ServerNoticeDialog open={open} onClose={handleDialogClose} onSubmit={handleSend} />
    </>
  );
};

export const ServerNoticeBulkButton = () => {
  const { selectedIds } = useListContext();
  const [open, setOpen] = useState(false);
  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);
  const notify = useNotify();
  const unselectAllUsers = useUnselectAll("users");
  const dataProvider = useDataProvider();

  const { mutate: sendNotices, isPending } = useMutation({
    mutationFn: (data) =>
      dataProvider.createMany("servernotices", {
        ids: selectedIds,
        data: data,
      }),
    onSuccess: () => {
      notify("resources.servernotices.action.send_success");
      unselectAllUsers();
      closeDialog();
    },
    onError: () =>
      notify("resources.servernotices.action.send_failure", {
        type: "error",
      }),
  });

  return (
    <>
      <Button label="resources.servernotices.send" onClick={openDialog} disabled={isPending}>
        <MessageIcon />
      </Button>
      <ServerNoticeDialog open={open} onClose={closeDialog} onSubmit={sendNotices} />
    </>
  );
};
