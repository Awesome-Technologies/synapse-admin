import React from "react";
import {
  BooleanField,
  BulkDeleteButton,
  Button,
  DatagridConfigurable,
  ExportButton,
  DeleteButton,
  List,
  NumberField,
  Pagination,
  SelectColumnsButton,
  TextField,
  TopToolbar,
  useCreate,
  useDataProvider,
  useListContext,
  useNotify,
  useTranslate,
  useRecordContext,
  useRefresh,
  useUnselectAll,
} from "react-admin";
import { useMutation } from "react-query";
import RoomDirectoryIcon from "@mui/icons-material/FolderShared";
import AvatarField from "./AvatarField";

const RoomDirectoryPagination = () => (
  <Pagination rowsPerPageOptions={[100, 500, 1000, 2000]} />
);

export const RoomDirectoryUnpublishButton = props => {
  const translate = useTranslate();

  return (
    <DeleteButton
      {...props}
      label="resources.room_directory.action.erase"
      redirect={false}
      mutationMode="pessimistic"
      confirmTitle={translate("resources.room_directory.action.title", {
        smart_count: 1,
      })}
      confirmContent={translate("resources.room_directory.action.content", {
        smart_count: 1,
      })}
      resource="room_directory"
      icon={<RoomDirectoryIcon />}
    />
  );
};

export const RoomDirectoryBulkUnpublishButton = props => (
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

export const RoomDirectoryBulkPublishButton = props => {
  const { selectedIds } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const unselectAllRooms = useUnselectAll("rooms");
  const dataProvider = useDataProvider();
  const { mutate, isLoading } = useMutation(
    () =>
      dataProvider.createMany("room_directory", {
        ids: selectedIds,
        data: {},
      }),
    {
      onSuccess: () => {
        notify("resources.room_directory.action.send_success");
        unselectAllRooms();
        refresh();
      },
      onError: () =>
        notify("resources.room_directory.action.send_failure", {
          type: "error",
        }),
    }
  );

  return (
    <Button
      {...props}
      label="resources.room_directory.action.create"
      onClick={mutate}
      disabled={isLoading}
    >
      <RoomDirectoryIcon />
    </Button>
  );
};

export const RoomDirectoryPublishButton = props => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const [create, { isLoading }] = useCreate();

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
    <Button
      {...props}
      label="resources.room_directory.action.create"
      onClick={handleSend}
      disabled={isLoading}
    >
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

export const RoomDirectoryList = () => (
  <List
    pagination={<RoomDirectoryPagination />}
    perPage={100}
    actions={<RoomDirectoryListActions />}
  >
    <DatagridConfigurable
      rowClick={(id, _resource, _record) => "/rooms/" + id + "/show"}
      bulkActionButtons={<RoomDirectoryBulkUnpublishButton />}
      omit={["room_id", "canonical_alias", "topic"]}
    >
      <AvatarField
        source="avatar_src"
        sortable={false}
        sx={{ height: "40px", width: "40px" }}
        label="resources.rooms.fields.avatar"
      />
      <TextField
        source="name"
        sortable={false}
        label="resources.rooms.fields.name"
      />
      <TextField
        source="room_id"
        sortable={false}
        label="resources.rooms.fields.room_id"
      />
      <TextField
        source="canonical_alias"
        sortable={false}
        label="resources.rooms.fields.canonical_alias"
      />
      <TextField
        source="topic"
        sortable={false}
        label="resources.rooms.fields.topic"
      />
      <NumberField
        source="num_joined_members"
        sortable={false}
        label="resources.rooms.fields.joined_members"
      />
      <BooleanField
        source="world_readable"
        sortable={false}
        label="resources.room_directory.fields.world_readable"
      />
      <BooleanField
        source="guest_can_join"
        sortable={false}
        label="resources.room_directory.fields.guest_can_join"
      />
    </DatagridConfigurable>
  </List>
);

const resource = {
  name: "room_directory",
  icon: RoomDirectoryIcon,
  list: RoomDirectoryList,
};

export default resource;
