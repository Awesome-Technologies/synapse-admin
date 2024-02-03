import React from "react";
import {
  BooleanField,
  BulkDeleteButton,
  DateField,
  Datagrid,
  DatagridConfigurable,
  DeleteButton,
  ExportButton,
  Filter,
  FunctionField,
  List,
  NumberField,
  Pagination,
  ReferenceField,
  ReferenceManyField,
  SearchInput,
  SelectColumnsButton,
  SelectField,
  Show,
  Tab,
  TabbedShowLayout,
  TextField,
  TopToolbar,
  useRecordContext,
  useTranslate,
} from "react-admin";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import FastForwardIcon from "@mui/icons-material/FastForward";
import HttpsIcon from "@mui/icons-material/Https";
import NoEncryptionIcon from "@mui/icons-material/NoEncryption";
import PageviewIcon from "@mui/icons-material/Pageview";
import UserIcon from "@mui/icons-material/Group";
import ViewListIcon from "@mui/icons-material/ViewList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EventIcon from "@mui/icons-material/Event";
import {
  RoomDirectoryBulkDeleteButton,
  RoomDirectoryBulkSaveButton,
  RoomDirectoryDeleteButton,
  RoomDirectorySaveButton,
} from "./RoomDirectory";

const date_format = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const RoomPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
);

const RoomTitle = props => {
  const record = useRecordContext();
  const translate = useTranslate();
  var name = "";
  if (record) {
    name = record.name !== "" ? record.name : record.id;
  }

  return (
    <span>
      {translate("resources.rooms.name", 1)} {name}
    </span>
  );
};

const RoomShowActions = ({ data, resource }) => {
  var roomDirectoryStatus = "";
  if (data) {
    roomDirectoryStatus = data.public;
  }

  return (
    <TopToolbar>
      {roomDirectoryStatus === false && (
        <RoomDirectorySaveButton record={data} />
      )}
      {roomDirectoryStatus === true && (
        <RoomDirectoryDeleteButton record={data} />
      )}
      <DeleteButton
        record={data}
        resource={resource}
        mutationMode="pessimistic"
        confirmTitle="resources.rooms.action.erase.title"
        confirmContent="resources.rooms.action.erase.content"
      />
    </TopToolbar>
  );
};

export const RoomShow = props => {
  const translate = useTranslate();
  return (
    <Show {...props} actions={<RoomShowActions />} title={<RoomTitle />}>
      <TabbedShowLayout>
        <Tab label="synapseadmin.rooms.tabs.basic" icon={<ViewListIcon />}>
          <TextField source="room_id" />
          <TextField source="name" />
          <TextField source="canonical_alias" />
          <ReferenceField source="creator" reference="users">
            <TextField source="id" />
          </ReferenceField>
        </Tab>

        <Tab
          label="synapseadmin.rooms.tabs.detail"
          icon={<PageviewIcon />}
          path="detail"
        >
          <TextField source="joined_members" />
          <TextField source="joined_local_members" />
          <TextField source="joined_local_devices" />
          <TextField source="state_events" />
          <TextField source="version" />
          <TextField
            source="encryption"
            emptyText={translate("resources.rooms.enums.unencrypted")}
          />
        </Tab>

        <Tab
          label="synapseadmin.rooms.tabs.members"
          icon={<UserIcon />}
          path="members"
        >
          <ReferenceManyField
            reference="room_members"
            target="room_id"
            addLabel={false}
          >
            <Datagrid
              style={{ width: "100%" }}
              rowClick={(id, resource, record) => "/users/" + id}
            >
              <TextField
                source="id"
                sortable={false}
                label="resources.users.fields.id"
              />
              <ReferenceField
                label="resources.users.fields.displayname"
                source="id"
                reference="users"
                sortable={false}
                link=""
              >
                <TextField source="displayname" sortable={false} />
              </ReferenceField>
            </Datagrid>
          </ReferenceManyField>
        </Tab>

        <Tab
          label="synapseadmin.rooms.tabs.permission"
          icon={<VisibilityIcon />}
          path="permission"
        >
          <BooleanField source="federatable" />
          <BooleanField source="public" />
          <SelectField
            source="join_rules"
            choices={[
              { id: "public", name: "resources.rooms.enums.join_rules.public" },
              { id: "knock", name: "resources.rooms.enums.join_rules.knock" },
              { id: "invite", name: "resources.rooms.enums.join_rules.invite" },
              {
                id: "private",
                name: "resources.rooms.enums.join_rules.private",
              },
            ]}
          />
          <SelectField
            source="guest_access"
            choices={[
              {
                id: "can_join",
                name: "resources.rooms.enums.guest_access.can_join",
              },
              {
                id: "forbidden",
                name: "resources.rooms.enums.guest_access.forbidden",
              },
            ]}
          />
          <SelectField
            source="history_visibility"
            choices={[
              {
                id: "invited",
                name: "resources.rooms.enums.history_visibility.invited",
              },
              {
                id: "joined",
                name: "resources.rooms.enums.history_visibility.joined",
              },
              {
                id: "shared",
                name: "resources.rooms.enums.history_visibility.shared",
              },
              {
                id: "world_readable",
                name: "resources.rooms.enums.history_visibility.world_readable",
              },
            ]}
          />
        </Tab>

        <Tab
          label={translate("resources.room_state.name", { smart_count: 2 })}
          icon={<EventIcon />}
          path="state"
        >
          <ReferenceManyField
            reference="room_state"
            target="room_id"
            addLabel={false}
          >
            <Datagrid style={{ width: "100%" }}>
              <TextField source="type" sortable={false} />
              <DateField
                source="origin_server_ts"
                showTime
                options={date_format}
                sortable={false}
              />
              <TextField source="content" sortable={false} />
              <ReferenceField
                source="sender"
                reference="users"
                sortable={false}
              >
                <TextField source="id" />
              </ReferenceField>
            </Datagrid>
          </ReferenceManyField>
        </Tab>

        <Tab
          label="resources.forward_extremities.name"
          icon={<FastForwardIcon />}
          path="forward_extremities"
        >
          <Box
            sx={{
              fontFamily: "Roboto, Helvetica, Arial, sans-serif",
              margin: "0.5em",
            }}
          >
            {translate("resources.rooms.helper.forward_extremities")}
          </Box>
          <ReferenceManyField
            reference="forward_extremities"
            target="room_id"
            addLabel={false}
          >
            <Datagrid style={{ width: "100%" }}>
              <TextField source="id" sortable={false} />
              <DateField
                source="received_ts"
                showTime
                options={date_format}
                sortable={false}
              />
              <NumberField source="depth" sortable={false} />
              <TextField source="state_group" sortable={false} />
            </Datagrid>
          </ReferenceManyField>
        </Tab>
      </TabbedShowLayout>
    </Show>
  );
};

const RoomBulkActionButtons = () => (
  <>
    <RoomDirectoryBulkSaveButton />
    <RoomDirectoryBulkDeleteButton />
    <BulkDeleteButton
      confirmTitle="resources.rooms.action.erase.title"
      confirmContent="resources.rooms.action.erase.content"
      mutationMode="pessimistic"
    />
  </>
);

const RoomFilter = props => (
  <Filter {...props}>
    <SearchInput source="search_term" alwaysOn />
  </Filter>
);

const RoomListActions = () => (
  <TopToolbar>
    <SelectColumnsButton />
    <ExportButton />
  </TopToolbar>
);

export const RoomList = () => {
  const theme = useTheme();

  return (
    <List
      pagination={<RoomPagination />}
      sort={{ field: "name", order: "ASC" }}
      filters={<RoomFilter />}
      actions={<RoomListActions />}
    >
      <DatagridConfigurable
        rowClick="show"
        bulkActionButtons={<RoomBulkActionButtons />}
        omit={[
          "joined_local_members",
          "state_events",
          "version",
          "federatable",
        ]}
      >
        <BooleanField
          source="is_encrypted"
          sortBy="encryption"
          TrueIcon={HttpsIcon}
          FalseIcon={NoEncryptionIcon}
          label={<HttpsIcon />}
          sx={{
            [`& [data-testid="true"]`]: { color: theme.palette.success.main },
            [`& [data-testid="false"]`]: { color: theme.palette.error.main },
          }}
        />
        <FunctionField
          source="name"
          render={record =>
            record["name"] || record["canonical_alias"] || record["id"]
          }
        />
        <TextField source="joined_members" />
        <TextField source="joined_local_members" />
        <TextField source="state_events" />
        <TextField source="version" />
        <BooleanField source="federatable" />
        <BooleanField source="public" />
      </DatagridConfigurable>
    </List>
  );
};
