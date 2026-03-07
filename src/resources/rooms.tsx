import EventIcon from "@mui/icons-material/Event";
import FastForwardIcon from "@mui/icons-material/FastForward";
import UserIcon from "@mui/icons-material/Group";
import HttpsIcon from "@mui/icons-material/Https";
import NoEncryptionIcon from "@mui/icons-material/NoEncryption";
import PageviewIcon from "@mui/icons-material/Pageview";
import RoomIcon from "@mui/icons-material/ViewList";
import ViewListIcon from "@mui/icons-material/ViewList";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import {
  BooleanField,
  BulkDeleteButton,
  DataTable,
  DateField,
  DeleteButton,
  ExportButton,
  FunctionField,
  List,
  ListProps,
  Pagination,
  ReferenceField,
  ReferenceManyField,
  ResourceProps,
  SearchInput,
  SelectColumnsButton,
  SelectField,
  Show,
  ShowProps,
  Tab,
  TabbedShowLayout,
  TextField,
  TopToolbar,
  useCreatePath,
  useTranslate,
  useRecordContext,
} from "react-admin";

import { DATE_FORMAT } from "../components/date";
import {
  RoomDirectoryBulkPublishButton,
  RoomDirectoryBulkUnpublishButton,
  RoomDirectoryPublishButton,
  RoomDirectoryUnpublishButton,
} from "./room_directory";

const RoomPagination = () => <Pagination rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />;
const roomFilters = [<SearchInput source="search_term" alwaysOn />];

const RoomTitle = () => {
  const record = useRecordContext();
  const translate = useTranslate();
  const name = record ? record.name || record.id : "";

  return (
    <span>
      {translate("resources.rooms.name", { smart_count: 1 })} {name}
    </span>
  );
};

const RoomShowActions = () => {
  const record = useRecordContext();
  const publishButton = record?.public ? <RoomDirectoryUnpublishButton /> : <RoomDirectoryPublishButton />;

  return (
    <TopToolbar>
      {publishButton}
      <DeleteButton
        mutationMode="pessimistic"
        confirmTitle="resources.rooms.action.erase.title"
        confirmContent="resources.rooms.action.erase.content"
      />
    </TopToolbar>
  );
};

export const RoomShow = (props: ShowProps) => {
  const translate = useTranslate();
  const createPath = useCreatePath();

  return (
    <Show {...props} actions={<RoomShowActions />} title={<RoomTitle />}>
      <TabbedShowLayout>
        <Tab label="synapseadmin.rooms.tabs.basic" icon={<ViewListIcon />}>
          <TextField source="room_id" />
          <TextField source="name" />
          <TextField source="topic" />
          <TextField source="canonical_alias" />
          <ReferenceField source="creator" reference="users">
            <TextField source="id" />
          </ReferenceField>
        </Tab>

        <Tab label="synapseadmin.rooms.tabs.detail" icon={<PageviewIcon />} path="detail">
          <TextField source="joined_members" />
          <TextField source="joined_local_members" />
          <TextField source="joined_local_devices" />
          <TextField source="state_events" />
          <TextField source="version" />
          <TextField source="encryption" emptyText={translate("resources.rooms.enums.unencrypted")} />
        </Tab>

        <Tab label="synapseadmin.rooms.tabs.members" icon={<UserIcon />} path="members">
          <ReferenceManyField reference="room_members" target="room_id" label={false}>
            <DataTable rowClick={id => createPath({ resource: "users", id, type: "edit" })} bulkActionButtons={false}>
              <DataTable.Col source="id" label="resources.users.fields.id" />
              <DataTable.Col label="resources.users.fields.displayname">
                <ReferenceField source="id" reference="users" link={false}>
                  <TextField source="displayname" />
                </ReferenceField>
              </DataTable.Col>
            </DataTable>
          </ReferenceManyField>
        </Tab>

        <Tab label="synapseadmin.rooms.tabs.permission" icon={<VisibilityIcon />} path="permission">
          <BooleanField source="federatable" />
          <BooleanField source="public" />
          <SelectField
            source="join_rules"
            choices={[
              { id: "public", name: "resources.rooms.enums.join_rules.public" },
              { id: "knock", name: "resources.rooms.enums.join_rules.knock" },
              { id: "invite", name: "resources.rooms.enums.join_rules.invite" },
              { id: "private", name: "resources.rooms.enums.join_rules.private" },
            ]}
          />
          <SelectField
            source="guest_access"
            choices={[
              { id: "can_join", name: "resources.rooms.enums.guest_access.can_join" },
              { id: "forbidden", name: "resources.rooms.enums.guest_access.forbidden" },
            ]}
          />
          <SelectField
            source="history_visibility"
            choices={[
              { id: "invited", name: "resources.rooms.enums.history_visibility.invited" },
              { id: "joined", name: "resources.rooms.enums.history_visibility.joined" },
              { id: "shared", name: "resources.rooms.enums.history_visibility.shared" },
              { id: "world_readable", name: "resources.rooms.enums.history_visibility.world_readable" },
            ]}
          />
        </Tab>

        <Tab label={translate("resources.room_state.name", { smart_count: 2 })} icon={<EventIcon />} path="state">
          <ReferenceManyField reference="room_state" target="room_id" label={false}>
            <DataTable bulkActionButtons={false}>
              <DataTable.Col source="type" />
              <DataTable.Col source="origin_server_ts">
                <DateField source="origin_server_ts" showTime options={DATE_FORMAT} />
              </DataTable.Col>
              <DataTable.Col source="content" />
              <DataTable.Col label="resources.users.fields.id">
                <ReferenceField source="sender" reference="users" link="edit">
                  <TextField source="id" />
                </ReferenceField>
              </DataTable.Col>
            </DataTable>
          </ReferenceManyField>
        </Tab>

        <Tab label="resources.forward_extremities.name" icon={<FastForwardIcon />} path="forward_extremities">
          <Box
            sx={{
              fontFamily: "Roboto, Helvetica, Arial, sans-serif",
              margin: "0.5em",
            }}
          >
            {translate("resources.rooms.helper.forward_extremities")}
          </Box>
          <ReferenceManyField reference="forward_extremities" target="room_id" label={false}>
            <DataTable bulkActionButtons={false}>
              <DataTable.Col source="id" />
              <DataTable.Col source="received_ts">
                <DateField source="received_ts" showTime options={DATE_FORMAT} />
              </DataTable.Col>
              <DataTable.Col source="depth" />
              <DataTable.Col source="state_group" />
            </DataTable>
          </ReferenceManyField>
        </Tab>
      </TabbedShowLayout>
    </Show>
  );
};

const RoomBulkActionButtons = () => (
  <>
    <RoomDirectoryBulkPublishButton />
    <RoomDirectoryBulkUnpublishButton />
    <BulkDeleteButton
      confirmTitle="resources.rooms.action.erase.title"
      confirmContent="resources.rooms.action.erase.content"
      mutationMode="pessimistic"
    />
  </>
);

const RoomListActions = () => (
  <TopToolbar>
    <SelectColumnsButton />
    <ExportButton />
  </TopToolbar>
);

export const RoomList = (props: ListProps) => {
  const theme = useTheme();

  return (
    <List
      {...props}
      pagination={<RoomPagination />}
      sort={{ field: "name", order: "ASC" }}
      filters={roomFilters}
      actions={<RoomListActions />}
    >
      <DataTable
        rowClick="show"
        bulkActionButtons={<RoomBulkActionButtons />}
        hiddenColumns={["joined_local_members", "state_events", "version", "federatable"]}
      >
        <DataTable.Col source="encryption" label={<HttpsIcon />}>
          <BooleanField
            source="is_encrypted"
            TrueIcon={HttpsIcon}
            FalseIcon={NoEncryptionIcon}
            sx={{
              [`& [data-testid="true"]`]: { color: theme.palette.success.main },
              [`& [data-testid="false"]`]: { color: theme.palette.error.main },
            }}
          />
        </DataTable.Col>
        <DataTable.Col label="resources.rooms.fields.name">
          <FunctionField render={record => record.name || record.canonical_alias || record.id} />
        </DataTable.Col>
        <DataTable.Col source="joined_members" />
        <DataTable.Col source="joined_local_members" />
        <DataTable.Col source="state_events" />
        <DataTable.Col source="version" />
        <DataTable.Col source="federatable" field={BooleanField} />
        <DataTable.Col source="public" field={BooleanField} />
      </DataTable>
    </List>
  );
};

const resource = {
  name: "rooms",
  icon: RoomIcon,
  list: RoomList,
  show: RoomShow,
  recordRepresentation: (record: { name?: string; canonical_alias?: string; id: string }) =>
    record.name || record.canonical_alias || record.id,
} satisfies ResourceProps;

export default resource;
