import { useMutation } from "@tanstack/react-query";
import RoomDirectoryIcon from "@mui/icons-material/FolderShared";
import {
  BooleanField,
  BulkDeleteButton,
  BulkDeleteButtonProps,
  Button,
  ButtonProps,
  DataTable,
  DeleteButton,
  DeleteButtonProps,
  ExportButton,
  List,
  NumberField,
  Pagination,
  ResourceProps,
  SelectColumnsButton,
  TextField,
  TopToolbar,
  useCreate,
  useCreatePath,
  useDataProvider,
  useListContext,
  useNotify,
  useRecordContext,
  useRefresh,
  useTranslate,
  useUnselectAll,
} from "react-admin";

import AvatarField from "../components/AvatarField";

const RoomDirectoryPagination = () => <Pagination rowsPerPageOptions={[100, 500, 1000, 2000]} />;

export const RoomDirectoryUnpublishButton = (props: DeleteButtonProps) => {
  const translate = useTranslate();

  return (
    <DeleteButton
      {...props}
      label="resources.room_directory.action.erase"
      redirect={false}
      mutationMode="pessimistic"
      confirmTitle={translate("resources.room_directory.action.title", { smart_count: 1 })}
      confirmContent={translate("resources.room_directory.action.content", { smart_count: 1 })}
      resource="room_directory"
      icon={<RoomDirectoryIcon />}
    />
  );
};

export const RoomDirectoryBulkUnpublishButton = (props: BulkDeleteButtonProps) => (
  <BulkDeleteButton
    {...props}
    label="resources.room_directory.action.erase"
    mutationMode="pessimistic"
    confirmTitle="resources.room_directory.action.title"
    confirmContent="resources.room_directory.action.content"
    resource="room_directory"
    icon={<RoomDirectoryIcon />}
  />
);

export const RoomDirectoryBulkPublishButton = (props: ButtonProps) => {
  const { selectedIds } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const unselectAllRooms = useUnselectAll("rooms");
  const dataProvider = useDataProvider();
  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      dataProvider.createMany("room_directory", {
        ids: selectedIds,
        data: {},
      }),
    onSuccess: () => {
      notify("resources.room_directory.action.send_success");
      unselectAllRooms();
      refresh();
    },
    onError: () =>
      notify("resources.room_directory.action.send_failure", {
        type: "error",
      }),
  });

  return (
    <Button {...props} label="resources.room_directory.action.create" onClick={() => mutate()} disabled={isPending}>
      <RoomDirectoryIcon />
    </Button>
  );
};

export const RoomDirectoryPublishButton = (props: ButtonProps) => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const [create, { isPending }] = useCreate();

  if (!record) {
    return null;
  }

  const handleSend = () => {
    create(
      "room_directory",
      { data: { id: record.id } },
      {
        onSuccess: () => {
          notify("resources.room_directory.action.send_success");
          refresh();
        },
        onError: () =>
          notify("resources.room_directory.action.send_failure", {
            type: "error",
          }),
      }
    );
  };

  return (
    <Button {...props} label="resources.room_directory.action.create" onClick={handleSend} disabled={isPending}>
      <RoomDirectoryIcon />
    </Button>
  );
};

const RoomDirectoryListActions = () => (
  <TopToolbar>
    <SelectColumnsButton />
    <ExportButton />
  </TopToolbar>
);

export const RoomDirectoryList = () => {
  const createPath = useCreatePath();

  return (
    <List pagination={<RoomDirectoryPagination />} perPage={100} actions={<RoomDirectoryListActions />}>
      <DataTable
        rowClick={id => createPath({ resource: "rooms", id, type: "show" })}
        bulkActionButtons={<RoomDirectoryBulkUnpublishButton />}
        hiddenColumns={["room_id", "canonical_alias", "topic"]}
      >
        <DataTable.Col source="avatar_src" label="resources.rooms.fields.avatar">
          <AvatarField source="avatar_src" sx={{ height: "40px", width: "40px" }} />
        </DataTable.Col>
        <DataTable.Col source="name" label="resources.rooms.fields.name" />
        <DataTable.Col source="room_id" label="resources.rooms.fields.room_id" />
        <DataTable.Col source="canonical_alias" label="resources.rooms.fields.canonical_alias" />
        <DataTable.Col source="topic" label="resources.rooms.fields.topic" />
        <DataTable.Col source="num_joined_members" field={NumberField} label="resources.rooms.fields.joined_members" />
        <DataTable.Col
          source="world_readable"
          field={BooleanField}
          label="resources.room_directory.fields.world_readable"
        />
        <DataTable.Col
          source="guest_can_join"
          field={BooleanField}
          label="resources.room_directory.fields.guest_can_join"
        />
      </DataTable>
    </List>
  );
};

const resource = {
  name: "room_directory",
  icon: RoomDirectoryIcon,
  list: RoomDirectoryList,
  recordRepresentation: (record: { name?: string; room_id: string }) => record.name || record.room_id,
} satisfies ResourceProps;

export default resource;
