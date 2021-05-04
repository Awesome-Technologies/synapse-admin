import React from "react";
import { cloneElement } from "react";
import {
  Datagrid,
  ExportButton,
  Filter,
  List,
  NumberField,
  Pagination,
  sanitizeListRestProps,
  SearchInput,
  TextField,
  TopToolbar,
  useListContext,
} from "react-admin";
import { DeleteMediaButton } from "./media";

const ListActions = props => {
  const { className, exporter, filters, maxResults, ...rest } = props;
  const {
    currentSort,
    resource,
    displayedFilters,
    filterValues,
    showFilter,
    total,
  } = useListContext();
  return (
    <TopToolbar className={className} {...sanitizeListRestProps(rest)}>
      {filters &&
        cloneElement(filters, {
          resource,
          showFilter,
          displayedFilters,
          filterValues,
          context: "button",
        })}
      <DeleteMediaButton />
      <ExportButton
        disabled={total === 0}
        resource={resource}
        sort={currentSort}
        filterValues={filterValues}
        maxResults={maxResults}
      />
    </TopToolbar>
  );
};

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
      actions={<ListActions />}
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
