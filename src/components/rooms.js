import React from "react";
import {
  Datagrid,
  List,
  TextField,
  Pagination,
  Filter,
  SearchInput,
} from "react-admin";

const RoomPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
);

const RoomFilter = props => (
  <Filter {...props}>
    <SearchInput source="search_term" alwaysOn />
  </Filter>
);

export const RoomList = props => (
  <List {...props} pagination={<RoomPagination />} filters={<RoomFilter />}>
    <Datagrid>
      <TextField source="room_id" />
      <TextField source="name" />
      <TextField source="canonical_alias" />
      <TextField source="joined_members" />
    </Datagrid>
  </List>
);
