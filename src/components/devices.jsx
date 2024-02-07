import React from "react";
import {
  DeleteButton,
  useDelete,
  useNotify,
  useRecordContext,
  useRefresh,
} from "react-admin";

export const DeviceRemoveButton = props => {
  const record = useRecordContext();
  const refresh = useRefresh();
  const notify = useNotify();

  const [removeDevice] = useDelete();

  if (!record) return null;

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
  };

  return (
    <DeleteButton
      {...props}
      label="ra.action.remove"
      confirmTitle="resources.devices.action.erase.title"
      confirmContent="resources.devices.action.erase.content"
      onConfirm={handleConfirm}
      mutationMode="pessimistic"
      redirect={false}
      translateOptions={{
        id: record.id,
        name: record.display_name ? record.display_name : record.id,
      }}
    />
  );
};
