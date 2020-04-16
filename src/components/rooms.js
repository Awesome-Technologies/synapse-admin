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
  }
}

const validateDisplayName = fieldval => fieldval === undefined ? "synapseadmin.rooms.room_name_required" : fieldval.length === 0 ? "synapseadmin.rooms.room_name_required" : undefined;

const removeLeadingWhitespace = fieldVal => fieldVal === undefined ? undefined : fieldVal.trimStart();

export const RoomCreate = props => (
  <Create record={generateRoomRecord()} {...props}>
    <SimpleForm>
      <TextInput source="room_name"
                 label="synapseadmin.rooms.room_name"
                 parse={removeLeadingWhitespace}
                 validate={validateDisplayName}/>
      <BooleanInput source="public"
                    label="synapseadmin.rooms.make_public"/>
    </SimpleForm>
  </Create>
);
