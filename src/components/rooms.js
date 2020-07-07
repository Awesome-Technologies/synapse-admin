import React from "react";
import {
  BooleanField,
  Datagrid,
  List,
  Pagination,
  SelectField,
  Show,
  Tab,
  TabbedShowLayout,
  TextField,
  useTranslate,
} from "react-admin";
import get from "lodash/get";
import { Tooltip, Typography } from "@material-ui/core";
import HttpsIcon from "@material-ui/icons/Https";
import NoEncryptionIcon from "@material-ui/icons/NoEncryption";
import PageviewIcon from "@material-ui/icons/Pageview";
import ViewListIcon from "@material-ui/icons/ViewList";
import VisibilityIcon from "@material-ui/icons/Visibility";

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

export const RoomList = props => (
  <List
    {...props}
    pagination={<RoomPagination />}
    sort={{ field: "name", order: "ASC" }}
  >
    <Datagrid rowClick="show">
      <EncryptionField
        source="is_encrypted"
        sortBy="encryption"
        label={<HttpsIcon />}
      />
      <TextField source="room_id" sortable={false} />
      <TextField source="name" />
      <TextField source="canonical_alias" />
      <TextField source="joined_members" />
      <TextField source="joined_local_members" />
      <TextField source="state_events" />
      <TextField source="version" />
      <BooleanField source="federatable" />
      <BooleanField source="public" />
    </Datagrid>
  </List>
);

const RoomTitle = ({ record }) => {
  const translate = useTranslate();
  var name = ""
  if (record) {
    name = record.name !== "" ? record.name : record.id
  }

  return (
    <span>
      {translate("resources.rooms.name", 1)} {name}
    </span>
  );
};

export const RoomShow = props => {
  const translate = useTranslate();
  return (
    <Show {...props} title={<RoomTitle />}>
      <TabbedShowLayout>
        <Tab label="synapseadmin.rooms.tabs.basic" icon={<ViewListIcon />}>
          <TextField source="room_id" />
          <TextField source="name" />
          <TextField source="canonical_alias" />
          <TextField source="creator" />
        </Tab>

        <Tab
          label="synapseadmin.rooms.tabs.detail"
          icon={<PageviewIcon />}
          path="detail"
        >
          <TextField source="joined_members" />
          <TextField source="joined_local_members" />
          <TextField source="state_events" />
          <TextField source="version" />
          <TextField
            source="encryption"
            emptyText={translate("resources.rooms.enums.unencrypted")}
          />
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
      </TabbedShowLayout>
    </Show>
  );
};
