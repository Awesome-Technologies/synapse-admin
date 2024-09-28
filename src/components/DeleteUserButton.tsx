import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Fragment, useState } from "react";
import { SimpleForm, BooleanInput, useTranslate, RaRecord, useNotify, useRedirect, useDelete, NotificationType, useDeleteMany, Identifier, useUnselectAll } from "react-admin";
import ActionDelete from "@mui/icons-material/Delete";
import ActionCheck from "@mui/icons-material/CheckCircle";
import AlertError from "@mui/icons-material/ErrorOutline";

interface DeleteUserButtonProps {
  selectedIds: Identifier[];
  confirmTitle: string;
  confirmContent: string;
}

const resourceName = "users";

const DeleteUserButton: React.FC<DeleteUserButtonProps> = (props) => {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);
  const [deleteMedia, setDeleteMedia] = useState(false);
  const [redactEvents, setRedactEvents] = useState(false);

  const notify = useNotify();
  const redirect = useRedirect();

  const [deleteMany, { isLoading }] = useDeleteMany();
  const unselectAll = useUnselectAll(resourceName);
  const recordIds = props.selectedIds;

  const handleDialogOpen = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);

  const handleDelete = (values: {deleteMedia: boolean, redactEvents: boolean}) => {
    deleteMany(
      resourceName,
      { ids: recordIds, meta: values },
      {
        onSuccess: () => {
          handleDialogClose();
          unselectAll();
          redirect("/users");
        },
        onError: (error) =>
          notify("ra.notification.data_provider_error", { type: 'error' as NotificationType }),
      }
    );
  };

  const handleConfirm = () => {
    setOpen(false);
    handleDelete({ deleteMedia: deleteMedia, redactEvents: redactEvents });
  };

  return (
    <Fragment>
      <Button
        onClick={handleDialogOpen}
        disabled={isLoading}
        className={"ra-delete-button"}
        key="button"
        size="small"
        sx={{
          "&.MuiButton-sizeSmall": {
            lineHeight: 1.5,
          },
        }}
        color={"error"}
        startIcon={<ActionDelete />}
      >
        {translate("ra.action.delete")}
      </Button>
      <Dialog open={open} onClose={handleDialogClose}>
        <DialogTitle>{translate(props.confirmTitle)}</DialogTitle>
        <DialogContent>
          <DialogContentText>{translate(props.confirmContent)}</DialogContentText>
          <SimpleForm toolbar={false}>
            <BooleanInput
              source="deleteMedia"
              value={deleteMedia}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDeleteMedia(event.target.checked)}
              label="resources.users.action.delete_media"
              defaultValue={false}
            />
            <BooleanInput
              source="redactEvents"
              value={redactEvents}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setRedactEvents(event.target.checked)}
              label="resources.users.action.redact_events"
              defaultValue={false}
            />
          </SimpleForm>
        </DialogContent>
        <DialogActions>
          <Button disabled={false} onClick={handleDialogClose} startIcon={<AlertError />}>
            {translate("ra.action.cancel")}
          </Button>
          <Button
            disabled={false}
            onClick={handleConfirm}
            className={"ra-confirm RaConfirm-confirmPrimary"}
            autoFocus
            startIcon={<ActionCheck />}
          >
            {translate("ra.action.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default DeleteUserButton;
