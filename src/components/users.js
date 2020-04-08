import React, { Fragment } from "react";
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
  Toolbar,
  SaveButton,
  DeleteButton,
  ListButton,
  BulkDeleteButton,
} from "react-admin";

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

const UserEditToolbar = props => (
  <Toolbar {...props} >
    <SaveButton submitOnEnter={true} />
    <DeleteButton
      label="resources.users.action.deactivate"
      submitOnEnter={false}
      variant="flat"
    />
    <ListButton
      label="resources.users.action.backtolist"
      submitOnEnter={false}
      variant="flat"
    />
  </Toolbar>
);

const UserBulkActionButtons = props => (
  <Fragment>
    <BulkDeleteButton {...props} label="resources.users.action.deactivate" />
  </Fragment>
);

export const UserList = props => (
  <List
    {...props}
    filters={<UserFilter />}
    filterDefaultValues={{ guests: true, deactivated: false }}
    bulkActionButtons={<UserBulkActionButtons />}
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
    <SimpleForm toolbar={<UserEditToolbar />}>
      <TextInput source="id" disabled />
      <TextInput source="displayname" />
      <PasswordInput source="password" autoComplete="new-password" />
      <BooleanInput source="admin" />
      <BooleanInput source="deactivated" />
    </SimpleForm>
  </Edit>
);
