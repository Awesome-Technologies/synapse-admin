import React, { Fragment } from "react";
import PersonPinIcon from "@material-ui/icons/PersonPin";
import SettingsInputComponentIcon from "@material-ui/icons/SettingsInputComponent";
import {
  ArrayInput,
  ArrayField,
  Datagrid,
  DateField,
  Create,
  Edit,
  List,
  Filter,
  Toolbar,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  FormTab,
  BooleanField,
  BooleanInput,
  ImageField,
  PasswordInput,
  TextField,
  TextInput,
  ReferenceField,
  SelectInput,
  BulkDeleteButton,
  DeleteButton,
  SaveButton,
  regex,
  useTranslate,
  Pagination,
} from "react-admin";
import { ServerNoticeButton, ServerNoticeBulkButton } from "./ServerNotices";

const UserPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
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

const UserBulkActionButtons = props => {
  const translate = useTranslate();
  return (
    <Fragment>
      <ServerNoticeBulkButton {...props} />
      <BulkDeleteButton
        {...props}
        label="resources.users.action.erase"
        title={translate("resources.users.helper.erase")}
      />
    </Fragment>
  );
};

export const UserList = props => (
  <List
    {...props}
    filters={<UserFilter />}
    filterDefaultValues={{ guests: true, deactivated: false }}
    bulkActionButtons={<UserBulkActionButtons />}
    pagination={<UserPagination />}
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
      <TextField source="id" sortable={false} />
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

const UserEditToolbar = props => {
  const translate = useTranslate();
  return (
    <Toolbar {...props}>
      <SaveButton submitOnEnter={true} />
      <DeleteButton
        label="resources.users.action.erase"
        title={translate("resources.users.helper.erase")}
      />
      <ServerNoticeButton />
    </Toolbar>
  );
};

export const UserCreate = props => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="id" autoComplete="off" validate={validateUser} />
      <TextInput source="displayname" />
      <PasswordInput source="password" autoComplete="new-password" />
      <BooleanInput source="admin" />
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
    </SimpleForm>
  </Create>
);

const UserTitle = ({ record }) => {
  const translate = useTranslate();
  return (
    <span>
      {translate("resources.users.name", {
        smart_count: 1,
      })}{" "}
      {record ? `"${record.displayname}"` : ""}
    </span>
  );
};
export const UserEdit = props => (
  <Edit {...props} title={<UserTitle />}>
    <TabbedForm toolbar={<UserEditToolbar />}>
      <FormTab label="resources.users.name" icon={<PersonPinIcon />}>
        <TextInput source="id" disabled />
        <TextInput source="displayname" />
        <PasswordInput source="password" autoComplete="new-password" />
        <BooleanInput source="admin" />
        <BooleanInput
          source="deactivated"
          helperText="resources.users.helper.deactivate"
        />
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
      </FormTab>
      <FormTab
        label="resources.connections.name"
        icon={<SettingsInputComponentIcon />}
      >
        <ReferenceField reference="connections" source="id" addLabel={false}>
          <ArrayField
            source="devices[].sessions[0].connections"
            label="resources.connections.name"
          >
            <Datagrid style={{ width: "100%" }}>
              <TextField source="ip" sortable={false} />
              <DateField
                source="last_seen"
                showTime
                options={{
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }}
                sortable={false}
              />
              <TextField
                source="user_agent"
                sortable={false}
                style={{ width: "100%" }}
              />
            </Datagrid>
          </ArrayField>
        </ReferenceField>
      </FormTab>
    </TabbedForm>
  </Edit>
);
