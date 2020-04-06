import React from "react";
import { Datagrid, List, TextField, SearchInput, Filter, Pagination } from "react-admin";

const RoomFilter = props => (
  <Filter {...props}>
    <SearchInput source="search_term" alwaysOn />
  </Filter>
);

export const RoomList = props => (
  <List
    {...props}
    sort={{ field: "alphabetical", order: "DESC" }}
    filters={<RoomFilter />}
  >

const RoomPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
);

export const RoomList = props => (
  <List {...props} pagination={<RoomPagination />}>

    <Datagrid>
      <TextField source="room_id" sortable={false} />
      <TextField source="name" sortBy="alphabetical" />
      <TextField source="canonical_alias" sortable={false} />
      <TextField source="joined_members" sortBy="size" />
    </Datagrid>
  </List>
);
