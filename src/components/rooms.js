import React, { Fragment } from "react";
import { Datagrid, List, TextField, BulkDeleteButton } from "react-admin";

const RoomBulkActionButtons = props => (
  <Fragment>
    <BulkDeleteButton {...props} label="resources.rooms.action.purge" />
  </Fragment>
);

export const RoomList = props => (
  <List {...props} bulkActionButtons={<RoomBulkActionButtons />}>
    <Datagrid>
      <TextField source="room_id" />
      <TextField source="name" />
      <TextField source="canonical_alias" />
      <TextField source="joined_members" />
    </Datagrid>
  </List>
);
