import React from "react";
import get from "lodash/get";
import { Tooltip, Typography } from "@material-ui/core";
import HttpsIcon from "@material-ui/icons/Https";
import NoEncryptionIcon from "@material-ui/icons/NoEncryption";
import ViewAgendaIcon from "@material-ui/icons/ViewAgenda";
import PageviewIcon from "@material-ui/icons/Pageview";
import VisibilityIcon from "@material-ui/icons/Visibility";
import {
  Datagrid,
  List,
  TextField,
  Pagination,
  Show,
  TabbedShowLayout,
  BooleanField,
  useTranslate,
  Tab,
} from "react-admin";

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
  return (
    <span>
      {translate("resources.rooms.name", { smart_count: 1 })}{" "}
      {record ? `"${record.name}"` : ""}
    </span>
  );
};

export const RoomShow = props => {
  const translate = useTranslate();
  return (
    <Show {...props} title={<RoomTitle />}>
      <TabbedShowLayout>
        <Tab
          label={translate("resources.rooms.tabs.basic")}
          icon={<ViewAgendaIcon />}
        >
          <TextField source="room_id" />
          <TextField source="name" />
          <TextField source="canonical_alias" />
          <TextField source="creator" />
        </Tab>
        <Tab
          label={translate("resources.rooms.tabs.detail")}
          icon={<PageviewIcon />}
          path="detail"
        >
          <TextField source="joined_members" />
          <TextField source="joined_local_members" />
          <TextField source="state_events" />
          <TextField source="version" />
          <TextField source="encryption" />
        </Tab>
        <Tab
          label={translate("resources.rooms.tabs.permission")}
          icon={<VisibilityIcon />}
          path="permission"
        >
          <BooleanField source="federatable" />
          <BooleanField source="public" />
          <TextField source="join_rules" />
          <TextField source="guest_access" />
          <TextField source="history_visibility" />
        </Tab>
      </TabbedShowLayout>
    </Show>
  );
};
