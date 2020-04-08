import React, { Fragment } from "react";
import {
  Datagrid,
  List,
  TextField,
  BulkDeleteButton,
  Pagination,
} from "react-admin";

const RoomBulkActionButtons = props => (
  <Fragment>
    <BulkDeleteButton {...props} label="resources.rooms.action.purge" />
  </Fragment>
);

const RoomPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
);

export const RoomList = props => (
  <List
    {...props}
    pagination={<RoomPagination />}
    bulkActionButtons={<RoomBulkActionButtons />}
  >
    <Datagrid>
      <TextField source="room_id" />
      <TextField source="name" />
      <TextField source="canonical_alias" />
      <TextField source="joined_members" />
    </Datagrid>
  </List>
);
