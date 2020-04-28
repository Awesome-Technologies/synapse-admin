import React from "react";
import {
  AutocompleteArrayInput,
  BooleanInput,
  Create,
  Datagrid,
  FormTab,
  List,
  Pagination,
  ReferenceArrayField,
  ReferenceArrayInput,
  Show,
  Tab,
  TabbedForm,
  TabbedShowLayout,
  TextField,
  TextInput,
  useTranslate,
} from "react-admin";
import ViewListIcon from "@material-ui/icons/ViewList";
import UserIcon from "@material-ui/icons/Group";

const RoomPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
);

export const RoomList = props => (
  <List {...props} pagination={<RoomPagination />}>
    <Datagrid rowClick="show">
      <TextField source="room_id" />
      <TextField source="name" />
      <TextField source="canonical_alias" />
      <TextField source="joined_members" />
    </Datagrid>
  </List>
);

const validateDisplayName = fieldval =>
  fieldval === undefined
    ? "synapseadmin.rooms.room_name_required"
    : fieldval.length === 0
    ? "synapseadmin.rooms.room_name_required"
    : undefined;

function approximateAliasLength(alias, homeserver) {
  /* TODO maybe handle punycode in homeserver URL */

  var te;

  // Support for TextEncoder is quite widespread, but the polyfill is
  // pretty large; We will only underestimate the size with the regular
  // length attribute of String, so we never prevent the user from using
  // an alias that is short enough for the server, but too long for our
  // heuristic.
  try {
    te = new TextEncoder();
  } catch (err) {
    if (err instanceof ReferenceError) {
      te = undefined;
    }
  }

  const aliasLength = te === undefined ? alias.length : te.encode(alias).length;

  return "#".length + aliasLength + ":".length + homeserver.length;
}

const validateAlias = fieldval => {
  if (fieldval === undefined) {
    return undefined;
  }
  const homeserver = localStorage.getItem("home_server_url");

  if (approximateAliasLength(fieldval, homeserver) > 255) {
    return "synapseadmin.rooms.alias_too_long";
  }
};

const removeLeadingWhitespace = fieldVal =>
  fieldVal === undefined ? undefined : fieldVal.trimStart();
const replaceAllWhitespace = fieldVal =>
  fieldVal === undefined ? undefined : fieldVal.replace(/\s/, "_");
const removeLeadingSigil = fieldVal =>
  fieldVal === undefined
    ? undefined
    : fieldVal.startsWith("#")
    ? fieldVal.substr(1)
    : fieldVal;

const validateHasAliasIfPublic = formdata => {
  let errors = {};
  if (formdata.public) {
    if (
      formdata.canonical_alias === undefined ||
      formdata.canonical_alias.trim().length === 0
    ) {
      errors.canonical_alias = "synapseadmin.rooms.alias_required_if_public";
    }
  }
  return errors;
};

export const RoomCreate = props => (
  <Create {...props}>
    <TabbedForm validate={validateHasAliasIfPublic}>
      <FormTab label="synapseadmin.rooms.details" icon={<ViewListIcon />}>
        <TextInput
          source="name"
          parse={removeLeadingWhitespace}
          validate={validateDisplayName}
        />
        <TextInput
          source="canonical_alias"
          parse={fv => replaceAllWhitespace(removeLeadingSigil(fv))}
          validate={validateAlias}
          placeholder="#"
        />
        <BooleanInput source="public" label="synapseadmin.rooms.make_public" />
      </FormTab>
      <FormTab
        label="resources.rooms.fields.invite_members"
        icon={<UserIcon />}
      >
        <ReferenceArrayInput
          reference="users"
          source="invitees"
          filterToQuery={searchText => ({ user_id: searchText })}
        >
          <AutocompleteArrayInput
            optionText="displayname"
            suggestionText="displayname"
          />
        </ReferenceArrayInput>
      </FormTab>
    </TabbedForm>
  </Create>
);

const RoomTitle = ({ record }) => {
  const translate = useTranslate();
  return (
    <span>
      {translate("resources.rooms.name", 1)} {record ? `"${record.name}"` : ""}
    </span>
  );
};
export const RoomShow = props => (
  <Show {...props} title={<RoomTitle />}>
    <TabbedShowLayout>
      <Tab label="synapseadmin.rooms.details" icon={<ViewListIcon />}>
        <TextField source="id" disabled />
        <TextField source="name" />
        <TextField source="canonical_alias" />
        <TextField source="join_rules" />
        <TextField source="guest_access" />
      </Tab>
      <Tab label="resources.rooms.fields.joined_members" icon={<UserIcon />}>
        <ReferenceArrayField reference="users" source="members">
          <Datagrid>
            <TextField source="id" />
            <TextField source="displayname" />
          </Datagrid>
        </ReferenceArrayField>
      </Tab>
    </TabbedShowLayout>
  </Show>
);
