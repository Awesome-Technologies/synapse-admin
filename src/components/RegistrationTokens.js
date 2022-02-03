import React from "react";
import {
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  DateTimeInput,
  Edit,
  Filter,
  List,
  maxValue,
  number,
  NumberField,
  NumberInput,
  regex,
  SimpleForm,
  TextInput,
  TextField,
  Toolbar,
} from "react-admin";

const date_format = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const validateToken = [regex(/^[A-Za-z0-9._~-]{0,64}$/)];
const validateUsesAllowed = [number()];
const validateLength = [number(), maxValue(64)];

const dateParser = v => {
  const d = new Date(v);
  if (isNaN(d)) return 0;
  return d.getTime();
};

const dateFormatter = v => {
  if (v === undefined || v === null) return;
  const d = new Date(v);

  const pad = "00";
  const year = d.getFullYear().toString();
  const month = (pad + (d.getMonth() + 1).toString()).slice(-2);
  const day = (pad + d.getDate().toString()).slice(-2);
  const hour = (pad + d.getHours().toString()).slice(-2);
  const minute = (pad + d.getMinutes().toString()).slice(-2);

  // target format yyyy-MM-ddThh:mm
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const RegistrationTokenFilter = props => (
  <Filter {...props}>
    <BooleanInput source="valid" alwaysOn />
  </Filter>
);

export const RegistrationTokenList = props => {
  return (
    <List
      {...props}
      filters={<RegistrationTokenFilter />}
      filterDefaultValues={{ valid: true }}
      pagination={false}
      perPage={500}
    >
      <Datagrid rowClick="edit">
        <TextField source="token" sortable={false} />
        <NumberField source="uses_allowed" sortable={false} />
        <NumberField source="pending" sortable={false} />
        <NumberField source="completed" sortable={false} />
        <DateField
          source="expiry_time"
          showTime
          options={date_format}
          sortable={false}
        />
      </Datagrid>
    </List>
  );
};

export const RegistrationTokenCreate = props => (
  <Create {...props}>
    <SimpleForm redirect="list" toolbar={<Toolbar alwaysEnableSaveButton />}>
      <TextInput
        source="token"
        autoComplete="off"
        validate={validateToken}
        resettable
      />
      <NumberInput
        source="length"
        validate={validateLength}
        helperText="resources.registration_tokens.helper.length"
        step={1}
      />
      <NumberInput
        source="uses_allowed"
        validate={validateUsesAllowed}
        step={1}
      />
      <DateTimeInput source="expiry_time" parse={dateParser} />
    </SimpleForm>
  </Create>
);

export const RegistrationTokenEdit = props => {
  return (
    <Edit {...props}>
      <SimpleForm>
        <TextInput source="token" disabled />
        <NumberInput source="pending" disabled />
        <NumberInput source="completed" disabled />
        <NumberInput
          source="uses_allowed"
          validate={validateUsesAllowed}
          step={1}
        />
        <DateTimeInput
          source="expiry_time"
          parse={dateParser}
          format={dateFormatter}
        />
      </SimpleForm>
    </Edit>
  );
};
