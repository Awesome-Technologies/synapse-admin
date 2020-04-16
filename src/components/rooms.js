import React from "react";
import {
  BooleanInput,
  Create,
  Datagrid,
  List,
  Pagination,
  SimpleForm,
  TextField,
  TextInput,
} from "react-admin";

const RoomPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
);

export const RoomList = props => (
  <List {...props} pagination={<RoomPagination />}>
    <Datagrid>
      <TextField source="room_id" />
      <TextField source="name" />
      <TextField source="canonical_alias" />
      <TextField source="joined_members" />
    </Datagrid>
  </List>
);

function generateRoomRecord() {
  return {
    room_name: "",
    public: true,
    alias: "",
  }
}

const validateDisplayName = fieldval => fieldval === undefined ? "synapseadmin.rooms.room_name_required" : fieldval.length === 0 ? "synapseadmin.rooms.room_name_required" : undefined;

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
  }
  catch (err) {
    if (err instanceof ReferenceError) {
      te = undefined;
    }
  }

  const aliasLength = te === undefined ? alias.length : te.encode(alias).length;

  return (
    "#".length +
      aliasLength +
      ":".length +
      homeserver.length
  );
}

const validateAlias = fieldval => {
  if (fieldval === undefined) {
    return undefined;
  }
  const homeserver = localStorage.getItem("home_server");

  if (approximateAliasLength(fieldval, homeserver) > 255) {
    return "synapseadmin.rooms.alias_too_long";
  }
}

const removeLeadingWhitespace = fieldVal => fieldVal === undefined ? undefined : fieldVal.trimStart();
const replaceAllWhitespace = fieldVal => fieldVal === undefined ? undefined : fieldVal.replace(/\s/, "_");
const removeLeadingSigil = fieldVal => fieldVal === undefined ? undefined : fieldVal.startsWith("#") ? fieldVal.substr(1) : fieldVal;

const validateHasAliasIfPublic = formdata => {
  let errors = {};
  if (formdata.public) {
    if (formdata.alias === undefined || formdata.alias.trim().length === 0) {
      errors.alias = "synapseadmin.rooms.alias_required_if_public"
    }
  }
  return errors;
}

export const RoomCreate = props => (
  <Create record={generateRoomRecord()} {...props}>
    <SimpleForm validate={validateHasAliasIfPublic}>
      <TextInput source="room_name"
                 parse={removeLeadingWhitespace}
                 validate={validateDisplayName}/>
      <TextInput source="alias"
                 parse={fv => replaceAllWhitespace(removeLeadingSigil(fv)) }
                 format={fv => fv === "" ? "" : "#" + fv}
                 validate={validateAlias}/>
      <BooleanInput source="public"
                    label="synapseadmin.rooms.make_public"/>
    </SimpleForm>
  </Create>
);
