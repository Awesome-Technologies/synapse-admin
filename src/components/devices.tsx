import { DeleteWithConfirmButton, DeleteWithConfirmButtonProps, useRecordContext } from "react-admin";

export const DeviceRemoveButton = (props: DeleteWithConfirmButtonProps) => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <DeleteWithConfirmButton
      {...props}
      label="ra.action.remove"
      confirmTitle="resources.devices.action.erase.title"
      confirmContent="resources.devices.action.erase.content"
      mutationMode="pessimistic"
      redirect={false}
      translateOptions={{
        id: record.id,
        name: record.display_name ? record.display_name : record.id,
      }}
    />
  );
};
