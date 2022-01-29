import React from "react";
import {
  Datagrid,
  DateField,
  Filter,
  List,
  Pagination,
  SearchInput,
  SimpleShowLayout,
  Show,
  TextField,
} from "react-admin";

const DestinationPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
);

const date_format = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const destinationRowStyle = (record, index) => ({
  backgroundColor: record.retry_last_ts > 0 ? "#ffcccc" : "white",
});

const DestinationFilter = ({ ...props }) => {
  return (
    <Filter {...props}>
      <SearchInput source="destination" alwaysOn />
    </Filter>
  );
};

export const DestinationList = props => {
  return (
    <List
      {...props}
      filters={<DestinationFilter />}
      pagination={<DestinationPagination />}
      sort={{ field: "destination", order: "ASC" }}
      bulkActionButtons={false}
    >
      <Datagrid rowClick="show" rowStyle={destinationRowStyle}>
        <TextField source="destination" />
        <DateField source="failure_ts" showTime options={date_format} />
        <DateField source="retry_last_ts" showTime options={date_format} />
        <TextField source="retry_interval" />
        <TextField source="last_successful_stream_ordering" />
      </Datagrid>
    </List>
  );
};

export const DestinationShow = props => {
  return (
    <Show {...props}>
      <SimpleShowLayout>
        <TextField source="destination" />
        <DateField source="failure_ts" showTime options={date_format} />
        <DateField source="retry_last_ts" showTime options={date_format} />
        <TextField source="retry_interval" />
        <TextField source="last_successful_stream_ordering" />
      </SimpleShowLayout>
    </Show>
  );
};
