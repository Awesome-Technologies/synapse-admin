import React from "react";
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
  SelectInput,
  ArrayInput,
  SimpleFormIterator,
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

export const UserList = props => (
  <List
    {...props}
    filters={<UserFilter />}
    filterDefaultValues={{ guests: true, deactivated: false }}
    bulkActionButtons={false}
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
      <ArrayInput source="threepids">
        <SimpleFormIterator>
          <SelectInput
            source="medium"
            choices={[
              { id: "email", name: "resources.users.email" },
              { id: "msisdn", name: "resources.users.msisdn" },
            ]}
          />
          <TextInput source="address" />
        </SimpleFormIterator>
      </ArrayInput>
      <PasswordInput source="password" autoComplete="new-password" />
      <BooleanInput source="admin" />
    </SimpleForm>
  </Create>
);

export const UserEdit = props => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="id" disabled />
      <TextInput source="avatar_url" disabled />
      <TextInput source="displayname" />
      <ArrayInput source="threepids">
        <SimpleFormIterator>
          <SelectInput
            source="medium"
            choices={[
              { id: "email", name: "resources.users.email" },
              { id: "msisdn", name: "resources.users.msisdn" },
            ]}
          />
          <TextInput source="address" />
        </SimpleFormIterator>
      </ArrayInput>
      <PasswordInput source="password" autoComplete="new-password" />
      <BooleanInput source="admin" />
      <BooleanInput source="deactivated" />
    </SimpleForm>
  </Edit>
);
