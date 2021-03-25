import React from "react";
import {
  Datagrid,
  Filter,
  List,
  NumberField,
  TextField,
  SearchInput,
  Pagination,
} from "react-admin";

const UserMediaStatsPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
);

const UserMediaStatsFilter = props => (
  <Filter {...props}>
    <SearchInput source="search_term" alwaysOn />
  </Filter>
);

export const UserMediaStatsList = props => {
  return (
    <List
      {...props}
      filters={<UserMediaStatsFilter />}
      pagination={<UserMediaStatsPagination />}
      sort={{ field: "media_length", order: "DESC" }}
      bulkActionButtons={false}
    >
      <Datagrid rowClick={(id, basePath, record) => "/users/" + id + "/media"}>
        <TextField source="user_id" label="resources.users.fields.id" />
        <TextField
          source="displayname"
          label="resources.users.fields.displayname"
        />
        <NumberField source="media_count" />
        <NumberField source="media_length" />
      </Datagrid>
    </List>
  );
};
