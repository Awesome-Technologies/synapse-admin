import React, { Fragment } from "react";
import { connect } from "react-redux";
import {
  BooleanField,
  BulkDeleteButton,
  DateField,
  Datagrid,
  DeleteButton,
  Filter,
  List,
  NumberField,
  Pagination,
  ReferenceField,
  ReferenceManyField,
  SearchInput,
  SelectField,
  Show,
  Tab,
  TabbedShowLayout,
  TextField,
  TopToolbar,
  useRecordContext,
  useTranslate,
} from "react-admin";
import get from "lodash/get";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { Tooltip, Typography, Chip } from "@mui/material";
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

const useStyles = makeStyles(theme => ({
  helper_forward_extremities: {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    margin: "0.5em",
  },
}));

const RoomPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
);

const EncryptionField = ({ source, record = {}, emptyText }) => {
  const translate = useTranslate();
  const value = get(record, source);
  let ariaLabel = value === false ? "ra.boolean.false" : "ra.boolean.true";

  if (value === false || value === true) {
    return (
      <Typography component="span" variant="body2">
        <Tooltip title={translate(ariaLabel, { _: ariaLabel })}>
          {value === true ? (
            <HttpsIcon data-testid="true" htmlColor="limegreen" />
          ) : (
            <NoEncryptionIcon data-testid="false" color="error" />
          )}
        </Tooltip>
      </Typography>
    );
  }

  return (
    <Typography component="span" variant="body2">
      {emptyText}
    </Typography>
  );
};

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

const RoomShowActions = ({ basePath, data, resource }) => {
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
        basePath={basePath}
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
  const classes = useStyles({ props });
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
              rowClick={(id, basePath, record) => "/users/" + id}
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
          <div className={classes.helper_forward_extremities}>
            {translate("resources.rooms.helper.forward_extremities")}
          </div>
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

const RoomBulkActionButtons = props => (
  <Fragment>
    <RoomDirectoryBulkSaveButton {...props} />
    <RoomDirectoryBulkDeleteButton {...props} />
    <BulkDeleteButton
      {...props}
      confirmTitle="resources.rooms.action.erase.title"
      confirmContent="resources.rooms.action.erase.content"
      mutationMode="pessimistic"
    />
  </Fragment>
);

const RoomFilter = ({ ...props }) => {
  const translate = useTranslate();
  return (
    <Filter {...props}>
      <SearchInput source="search_term" alwaysOn />
      <Chip
        label={translate("resources.rooms.fields.joined_local_members")}
        source="joined_local_members"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
      <Chip
        label={translate("resources.rooms.fields.state_events")}
        source="state_events"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
      <Chip
        label={translate("resources.rooms.fields.version")}
        source="version"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
      <Chip
        label={translate("resources.rooms.fields.federatable")}
        source="federatable"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
    </Filter>
  );
};

const RoomNameField = props => {
  const { source } = props;
  const record = useRecordContext();
  return (
    <span>{record[source] || record["canonical_alias"] || record["id"]}</span>
  );
};

RoomNameField.propTypes = {
  label: PropTypes.string,
  record: PropTypes.object,
  source: PropTypes.string.isRequired,
};

const FilterableRoomList = ({ roomFilters, dispatch, ...props }) => {
  const filter = roomFilters;
  const localMembersFilter =
    filter && filter.joined_local_members ? true : false;
  const stateEventsFilter = filter && filter.state_events ? true : false;
  const versionFilter = filter && filter.version ? true : false;
  const federateableFilter = filter && filter.federatable ? true : false;

  return (
    <List
      {...props}
      pagination={<RoomPagination />}
      sort={{ field: "name", order: "ASC" }}
      filters={<RoomFilter />}
      bulkActionButtons={<RoomBulkActionButtons />}
    >
      <Datagrid rowClick="show">
        <EncryptionField
          source="is_encrypted"
          sortBy="encryption"
          label={<HttpsIcon />}
        />
        <RoomNameField source="name" />
        <TextField source="joined_members" />
        {localMembersFilter && <TextField source="joined_local_members" />}
        {stateEventsFilter && <TextField source="state_events" />}
        {versionFilter && <TextField source="version" />}
        {federateableFilter && <BooleanField source="federatable" />}
        <BooleanField source="public" />
      </Datagrid>
    </List>
  );
};

function mapStateToProps(state) {
  return {
    roomFilters: state.admin.resources.rooms.list.params.displayedFilters,
  };
}

export const RoomList = connect(mapStateToProps)(FilterableRoomList);
