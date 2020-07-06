import React from "react";
import {
  Datagrid,
  List,
  TextField,
  Pagination,
  Filter,
  SearchInput,
  BooleanField,
  useTranslate,
} from "react-admin";
import get from "lodash/get";
import { Tooltip, Typography } from "@material-ui/core";
import HttpsIcon from "@material-ui/icons/Https";
import NoEncryptionIcon from "@material-ui/icons/NoEncryption";

const RoomPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
);

const RoomFilter = props => (
  <Filter {...props}>
    <SearchInput source="search_term" alwaysOn />
  </Filter>
);

const EncryptionField = ({ source, record = {}, emptyText }) => {
  const translate = useTranslate();
  const value = get(record, source);
  let ariaLabel = value === false ? "ra.boolean.false" : "ra.boolean.true";

  if (value === false || value === true) {
    return (
      <Typography component="span" variant="body2">
        <Tooltip title={translate(ariaLabel, { _: ariaLabel })}>
          {value === true ? (
            <HttpsIcon data-testid="true" htmlColor="limegreen" />
          ) : (
            <NoEncryptionIcon data-testid="false" color="error" />
          )}
        </Tooltip>
      </Typography>
    );
  }

  return (
    <Typography component="span" variant="body2">
      {emptyText}
    </Typography>
  );
};

export const RoomList = props => (
  <List
    {...props}
    pagination={<RoomPagination />}
    sort={{ field: "name", order: "ASC" }}
    filters={<RoomFilter />}
  >
    <Datagrid>
      <EncryptionField
        source="is_encrypted"
        sortBy="encryption"
        label={<HttpsIcon />}
      />
      <TextField source="room_id" sortable={false} />
      <TextField source="name" />
      <TextField source="canonical_alias" />
      <TextField source="joined_members" />
      <TextField source="joined_local_members" />
      <TextField source="state_events" />
      <TextField source="version" />
      <BooleanField source="federatable" />
      <BooleanField source="public" />
    </Datagrid>
  </List>
);
