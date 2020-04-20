import React from "react";
import { Datagrid, List, TextField, Pagination } from "react-admin";

const RoomPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
);

export const RoomList = props => (
  <List {...props} pagination={<RoomPagination />}>
    <Datagrid>
      <TextField source="room_id" />
      <TextField source="name" />
      <TextField source="canonical_alias" />
      <TextField source="joined_members" />
    </Datagrid>
  </List>
);
