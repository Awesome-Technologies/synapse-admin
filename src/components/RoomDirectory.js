import React, { Fragment } from "react";
import { Avatar, Chip } from "@mui/material";
import { connect } from "react-redux";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import { makeStyles } from "@material-ui/core/styles";
import {
  BooleanField,
  BulkDeleteButton,
  Button,
  Datagrid,
  DeleteButton,
  Filter,
  List,
  NumberField,
  Pagination,
  TextField,
  useCreate,
  useMutation,
  useNotify,
  useTranslate,
  useRecordContext,
  useRefresh,
  useUnselectAll,
} from "react-admin";

const useStyles = makeStyles({
  small: {
    height: "40px",
    width: "40px",
  },
});

const RoomDirectoryPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[100, 500, 1000, 2000]} />
);

export const RoomDirectoryDeleteButton = props => {
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
      icon={<FolderSharedIcon />}
    />
  );
};

export const RoomDirectoryBulkDeleteButton = props => (
  <BulkDeleteButton
    {...props}
    label="resources.room_directory.action.erase"
    mutationMode="pessimistic"
    confirmTitle="resources.room_directory.action.title"
    confirmContent="resources.room_directory.action.content"
    resource="room_directory"
    icon={<FolderSharedIcon />}
  />
);

export const RoomDirectoryBulkSaveButton = ({ selectedIds }) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const unselectAll = useUnselectAll();
  const [createMany, { loading }] = useMutation();

  const handleSend = values => {
    createMany(
      {
        type: "createMany",
        resource: "room_directory",
        payload: { ids: selectedIds, data: {} },
      },
      {
        onSuccess: ({ data }) => {
          notify("resources.room_directory.action.send_success");
          unselectAll("rooms");
          refresh();
        },
        onFailure: error =>
          notify("resources.room_directory.action.send_failure", {
            type: "error",
          }),
      }
    );
  };

  return (
    <Button
      label="resources.room_directory.action.create"
      onClick={handleSend}
      disabled={loading}
    >
      <FolderSharedIcon />
    </Button>
  );
};

export const RoomDirectorySaveButton = props => {
  const record = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const [create, { loading }] = useCreate("room_directory");

  const handleSend = values => {
    create(
      {
        payload: { data: { id: record.id } },
      },
      {
        onSuccess: ({ data }) => {
          notify("resources.room_directory.action.send_success");
          refresh();
        },
        onFailure: error =>
          notify("resources.room_directory.action.send_failure", {
            type: "error",
          }),
      }
    );
  };

  return (
    <Button
      label="resources.room_directory.action.create"
      onClick={handleSend}
      disabled={loading}
    >
      <FolderSharedIcon />
    </Button>
  );
};

const RoomDirectoryBulkActionButtons = props => (
  <Fragment>
    <RoomDirectoryBulkDeleteButton {...props} />
  </Fragment>
);

const AvatarField = ({ source, className, record = {} }) => (
  <Avatar src={record[source]} className={className} />
);

const RoomDirectoryFilter = ({ ...props }) => {
  const translate = useTranslate();
  return (
    <Filter {...props}>
      <Chip
        label={translate("resources.rooms.fields.room_id")}
        source="room_id"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
      <Chip
        label={translate("resources.rooms.fields.topic")}
        source="topic"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
      <Chip
        label={translate("resources.rooms.fields.canonical_alias")}
        source="canonical_alias"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
    </Filter>
  );
};

export const FilterableRoomDirectoryList = ({
  roomDirectoryFilters,
  dispatch,
  ...props
}) => {
  const classes = useStyles();
  const filter = roomDirectoryFilters;
  const roomIdFilter = filter && filter.room_id ? true : false;
  const topicFilter = filter && filter.topic ? true : false;
  const canonicalAliasFilter = filter && filter.canonical_alias ? true : false;

  return (
    <List
      {...props}
      pagination={<RoomDirectoryPagination />}
      bulkActionButtons={<RoomDirectoryBulkActionButtons />}
      filters={<RoomDirectoryFilter />}
      perPage={100}
    >
      <Datagrid rowClick={(id, basePath, record) => "/rooms/" + id + "/show"}>
        <AvatarField
          source="avatar_src"
          sortable={false}
          className={classes.small}
          label="resources.rooms.fields.avatar"
        />
        <TextField
          source="name"
          sortable={false}
          label="resources.rooms.fields.name"
        />
        {roomIdFilter && (
          <TextField
            source="room_id"
            sortable={false}
            label="resources.rooms.fields.room_id"
          />
        )}
        {canonicalAliasFilter && (
          <TextField
            source="canonical_alias"
            sortable={false}
            label="resources.rooms.fields.canonical_alias"
          />
        )}
        {topicFilter && (
          <TextField
            source="topic"
            sortable={false}
            label="resources.rooms.fields.topic"
          />
        )}
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
      </Datagrid>
    </List>
  );
};

function mapStateToProps(state) {
  return {
    roomDirectoryFilters:
      state.admin.resources.room_directory.list.params.displayedFilters,
  };
}

export const RoomDirectoryList = connect(mapStateToProps)(
  FilterableRoomDirectoryList
);
