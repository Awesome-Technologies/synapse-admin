import React from "react";
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

export const RoomList = props => (
  <List {...props} pagination={<RoomPagination />}>
    <Datagrid rowClick="show">
      <TextField source="room_id" />
      <TextField source="name" />
      <TextField source="canonical_alias" />
      <TextField source="joined_members" />
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
