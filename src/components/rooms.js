import React from "react";
import {
  Datagrid,
  List,
  TextField,
  Pagination,
  BooleanField,
} from "react-admin";

const RoomPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
);

export const RoomList = props => (
  <List
    {...props}
    pagination={<RoomPagination />}
    sort={{ field: "name", order: "ASC" }}
  >
    <Datagrid>
      <TextField source="room_id" sortable={false} />
      <TextField source="name" />
      <TextField source="canonical_alias" />
      <TextField source="joined_members" />
      <TextField source="joined_local_members" />
      <TextField source="state_events" />
      <TextField source="version" />
      <BooleanField source="is_encrypted" />
      <BooleanField source="federatable" />
      <BooleanField source="public" />
    </Datagrid>
  </List>
);
