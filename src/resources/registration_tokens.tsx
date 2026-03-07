import RegistrationTokenIcon from "@mui/icons-material/ConfirmationNumber";
import {
  BooleanInput,
  Create,
  CreateProps,
  DataTable,
  DateField,
  DateTimeInput,
  Edit,
  EditProps,
  List,
  ListProps,
  maxValue,
  number,
  NumberField,
  NumberInput,
  regex,
  ResourceProps,
  SaveButton,
  SimpleForm,
  TextInput,
  TextField,
  Toolbar,
} from "react-admin";

import { DATE_FORMAT, dateFormatter, dateParser } from "../components/date";

const validateToken = [regex(/^[A-Za-z0-9._~-]{0,64}$/)];
const validateUsesAllowed = [number()];
const validateLength = [number(), maxValue(64)];

const registrationTokenFilters = [<BooleanInput source="valid" alwaysOn />];

export const RegistrationTokenList = (props: ListProps) => (
  <List
    {...props}
    filters={registrationTokenFilters}
    filterDefaultValues={{ valid: true }}
    pagination={false}
    perPage={500}
  >
    <DataTable rowClick="edit">
      <DataTable.Col source="token" />
      <DataTable.Col source="uses_allowed" field={NumberField} />
      <DataTable.Col source="pending" field={NumberField} />
      <DataTable.Col source="completed" field={NumberField} />
      <DataTable.Col source="expiry_time">
        <DateField source="expiry_time" showTime options={DATE_FORMAT} />
      </DataTable.Col>
    </DataTable>
  </List>
);

export const RegistrationTokenCreate = (props: CreateProps) => (
  <Create {...props} redirect="list">
    <SimpleForm
      toolbar={
        <Toolbar>
          {/* It is possible to create tokens per default without input. */}
          <SaveButton alwaysEnable />
        </Toolbar>
      }
    >
      <TextInput source="token" autoComplete="off" validate={validateToken} resettable />
      <NumberInput
        source="length"
        validate={validateLength}
        helperText="resources.registration_tokens.helper.length"
        step={1}
      />
      <NumberInput source="uses_allowed" validate={validateUsesAllowed} step={1} />
      <DateTimeInput source="expiry_time" parse={dateParser} format={dateFormatter} />
    </SimpleForm>
  </Create>
);

export const RegistrationTokenEdit = (props: EditProps) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="token" disabled />
      <NumberInput source="pending" disabled />
      <NumberInput source="completed" disabled />
      <NumberInput source="uses_allowed" validate={validateUsesAllowed} step={1} />
      <DateTimeInput source="expiry_time" parse={dateParser} format={dateFormatter} />
    </SimpleForm>
  </Edit>
);

const resource = {
  name: "registration_tokens",
  icon: RegistrationTokenIcon,
  list: RegistrationTokenList,
  edit: RegistrationTokenEdit,
  create: RegistrationTokenCreate,
  recordRepresentation: (record: { token: string }) => record.token,
} satisfies ResourceProps;

export default resource;
