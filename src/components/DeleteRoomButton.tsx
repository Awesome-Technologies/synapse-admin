import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Fragment, useState } from "react";
import { SimpleForm, BooleanInput, useTranslate, RaRecord, useNotify, useRedirect, useDelete, NotificationType, useDeleteMany, Identifier, useUnselectAll } from "react-admin";
import ActionDelete from "@mui/icons-material/Delete";
import ActionCheck from "@mui/icons-material/CheckCircle";
import AlertError from "@mui/icons-material/ErrorOutline";

interface DeleteRoomButtonProps {
  selectedIds: Identifier[];
  confirmTitle: string;
  confirmContent: string;
}

const resourceName = "rooms";

const DeleteRoomButton: React.FC<DeleteRoomButtonProps> = (props) => {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);
  const [block, setBlock] = useState(true);

  const notify = useNotify();
  const redirect = useRedirect();

  const [deleteMany, { isLoading }] = useDeleteMany();
  const unselectAll = useUnselectAll(resourceName);
  const recordIds = props.selectedIds;

  const handleDialogOpen = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);

  const handleDelete = (values: {block: boolean}) => {
    deleteMany(
      resourceName,
      { ids: recordIds, meta: values },
      {
        onSuccess: () => {
          notify("resources.rooms.action.erase.success");
          handleDialogClose();
          unselectAll();
          redirect("/rooms");
        },
        onError: (error) =>
          notify("resources.rooms.action.erase.failure", { type: 'error' as NotificationType }),
      }
    );
  };

  const handleConfirm = () => {
    setOpen(false);
    handleDelete({ block: block });
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
              source="block"
              value={block}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setBlock(event.target.checked)}
              label="resources.rooms.action.erase.fields.block"
              defaultValue={true}
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

export default DeleteRoomButton;
