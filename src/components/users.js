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

function generateRandomUser() {
  const homeserver = localStorage.getItem("home_server");
  const user_id =
    "@" +
    Array(8)
      .fill("0123456789abcdefghijklmnopqrstuvwxyz")
      .map(
        x =>
          x[
            Math.floor(
              (crypto.getRandomValues(new Uint32Array(1))[0] /
                (0xffffffff + 1)) *
                x.length
            )
          ]
      )
      .join("") +
    ":" +
    homeserver;

  const password = Array(20)
    .fill(
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$"
    )
    .map(
      x =>
        x[
          Math.floor(
            (crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1)) *
              x.length
          )
        ]
    )
    .join("");

  return {
    id: user_id,
    password: password,
  };
}

// https://matrix.org/docs/spec/appendices#user-identifiers
const validateUser = regex(
  /^@[a-z0-9._=\-/]+:.*/,
  "synapseadmin.users.invalid_user_id"
);

export const UserCreate = props => (
  <Create record={generateRandomUser()} {...props}>
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
