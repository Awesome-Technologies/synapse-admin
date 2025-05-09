import RoomDirectoryIcon from "@mui/icons-material/FolderShared";
import {
  BooleanField,
  BulkDeleteButton,
  BulkDeleteButtonProps,
  Button,
  ButtonProps,
  DatagridConfigurable,
  DeleteButtonProps,
  ExportButton,
  DeleteButton,
  List,
  NumberField,
  Pagination,
  ResourceProps,
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
import { useMutation } from "@tanstack/react-query";

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
    <Button {...props} label="resources.room_directory.action.create" onClick={mutate} disabled={isPending}>
      <RoomDirectoryIcon />
    </Button>
  );
};

export const RoomDirectoryPublishButton = (props: ButtonProps) => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const [create, { isLoading }] = useCreate();

  if (!record) {
    return;
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
    <Button {...props} label="resources.room_directory.action.create" onClick={handleSend} disabled={isLoading}>
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
  <List pagination={<RoomDirectoryPagination />} perPage={100} actions={<RoomDirectoryListActions />}>
    <DatagridConfigurable
      rowClick={id => "/rooms/" + id + "/show"}
      bulkActionButtons={<RoomDirectoryBulkUnpublishButton />}
      omit={["room_id", "canonical_alias", "topic"]}
    >
      <AvatarField
        source="avatar_src"
        sortable={false}
        sx={{ height: "40px", width: "40px" }}
        label="resources.rooms.fields.avatar"
      />
      <TextField source="name" sortable={false} label="resources.rooms.fields.name" />
      <TextField source="room_id" sortable={false} label="resources.rooms.fields.room_id" />
      <TextField source="canonical_alias" sortable={false} label="resources.rooms.fields.canonical_alias" />
      <TextField source="topic" sortable={false} label="resources.rooms.fields.topic" />
      <NumberField source="num_joined_members" sortable={false} label="resources.rooms.fields.joined_members" />
      <BooleanField source="world_readable" sortable={false} label="resources.room_directory.fields.world_readable" />
      <BooleanField source="guest_can_join" sortable={false} label="resources.room_directory.fields.guest_can_join" />
    </DatagridConfigurable>
  </List>
);

const resource: ResourceProps = {
  name: "room_directory",
  icon: RoomDirectoryIcon,
  list: RoomDirectoryList,
};

export default resource;
