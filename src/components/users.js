import React, { cloneElement } from "react";
import {
  Datagrid,
  Create,
  Edit,
  List,
  Filter,
  SimpleForm,
  BooleanField,
  BooleanInput,
  ImageField,
  PasswordInput,
  TextField,
  TextInput,
  ReferenceField,
  regex,
  CreateButton,
  ExportButton,
  TopToolbar,
  sanitizeListRestProps,
} from "react-admin";

const ListActions = ({
    currentSort,
    className,
    resource,
    filters,
    displayedFilters,
    exporter, // you can hide ExportButton if exporter = (null || false)
    filterValues,
    permanentFilter,
    hasCreate, // you can hide CreateButton if hasCreate = false
    basePath,
    selectedIds,
    onUnselectItems,
    showFilter,
    maxResults,
    total,
    ...rest
}) => (
    <TopToolbar className={className} {...sanitizeListRestProps(rest)}>
        {filters && cloneElement(filters, {
            resource,
            showFilter,
            displayedFilters,
            filterValues,
            context: 'button',
        })}
      <CreateButton basePath={basePath} />
      <ExportButton
        disabled={total === 0}
        resource={resource}
        sort={currentSort}
        filter={{ ...filterValues, ...permanentFilter }}
        exporter={exporter}
        maxResults={maxResults}
      />
    </TopToolbar>
);

const UserFilter = props => (
  <Filter {...props}>
    <BooleanInput source="guests" alwaysOn />
    <BooleanInput
      label="resources.users.fields.show_deactivated"
      source="deactivated"
      alwaysOn
    />
  </Filter>
);

export const UserList = props => (
  <List
    {...props}
    filters={<UserFilter />}
    filterDefaultValues={{ guests: true, deactivated: false }}
    bulkActionButtons={false}
    actions={<ListActions maxResults={10000} />}
  >
    <Datagrid rowClick="edit">
      <ReferenceField
        source="Avatar"
        reference="users"
        link={false}
        sortable={false}
      >
        <ImageField source="avatar_url" title="displayname" />
      </ReferenceField>
      <TextField source="id" />
      {/* Hack since the users endpoint does not give displaynames in the list*/}
      <ReferenceField
        source="name"
        reference="users"
        link={false}
        sortable={false}
      >
        <TextField source="displayname" />
      </ReferenceField>
      <BooleanField source="is_guest" sortable={false} />
      <BooleanField source="admin" sortable={false} />
      <BooleanField source="deactivated" sortable={false} />
    </Datagrid>
  </List>
);

// https://matrix.org/docs/spec/appendices#user-identifiers
const validateUser = regex(
  /^@[a-z0-9._=\-/]+:.*/,
  "synapseadmin.users.invalid_user_id"
);

export const UserCreate = props => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="id" autoComplete="off" validate={validateUser} />
      <TextInput source="displayname" />
      <PasswordInput source="password" autoComplete="new-password" />
      <BooleanInput source="admin" />
    </SimpleForm>
  </Create>
);

export const UserEdit = props => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="id" disabled />
      <TextInput source="displayname" />
      <PasswordInput source="password" autoComplete="new-password" />
      <BooleanInput source="admin" />
      <BooleanInput source="deactivated" />
    </SimpleForm>
  </Edit>
);
