import React from "react";
import { Datagrid, List, TextField } from "react-admin";

export const RoomList = props => (
  <List {...props}>
    <Datagrid>
      <TextField source="room_id" />
      <TextField source="name" />
      <TextField source="canonical_alias" />
      <TextField source="joined_members" />
    </Datagrid>
  </List>
);
