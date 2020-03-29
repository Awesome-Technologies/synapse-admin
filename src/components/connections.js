import React from "react";
import {
  Datagrid,
  Show,
  SimpleForm,
  TextField,
  ArrayField,
  DateField,
} from "react-admin";

export const ConnectionsShow = props => (
  <Show {...props}>
    <SimpleForm toolbar={false}>
      <TextField source="user_id" label="resources.users.fields.id" />
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
    </SimpleForm>
  </Show>
);
