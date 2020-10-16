import React, { cloneElement, Fragment } from "react";
import Avatar from "@material-ui/core/Avatar";
import PersonPinIcon from "@material-ui/icons/PersonPin";
import ContactMailIcon from "@material-ui/icons/ContactMail";
import DevicesIcon from "@material-ui/icons/Devices";
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
  PasswordInput,
  TextField,
  TextInput,
  SearchInput,
  ReferenceField,
  ReferenceManyField,
  SelectField,
  SelectInput,
  BulkDeleteButton,
  DeleteButton,
  SaveButton,
  regex,
  useTranslate,
  Pagination,
  CreateButton,
  ExportButton,
  TopToolbar,
  sanitizeListRestProps,
} from "react-admin";
import SaveQrButton from "./SaveQrButton";
import { ServerNoticeButton, ServerNoticeBulkButton } from "./ServerNotices";
import { DeviceRemoveButton } from "./devices";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  small: {
    height: "40px",
    width: "40px",
  },
  large: {
    height: "120px",
    width: "120px",
    float: "right",
  },
});

const UserListActions = ({
  currentSort,
  className,
  resource,
  filters,
  displayedFilters,
  exporter, // you can hide ExportButton if exporter = (null || false)
  filterValues,
  permanentFilter,
  hasCreate, // you can hide CreateButton if hasCreate = false
  basePath,
  selectedIds,
  onUnselectItems,
  showFilter,
  maxResults,
  total,
  ...rest
}) => (
  <TopToolbar className={className} {...sanitizeListRestProps(rest)}>
    {filters &&
      cloneElement(filters, {
        resource,
        showFilter,
        displayedFilters,
        filterValues,
        context: "button",
      })}
    <CreateButton basePath={basePath} />
    <ExportButton
      disabled={total === 0}
      resource={resource}
      sort={currentSort}
      filter={{ ...filterValues, ...permanentFilter }}
      exporter={exporter}
      maxResults={maxResults}
    />
  </TopToolbar>
);

const UserPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
);

const UserFilter = props => (
  <Filter {...props}>
    <SearchInput source="user_id" alwaysOn />
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

const AvatarField = ({ source, className, record = {} }) => (
  <Avatar src={record[source]} className={className} />
);

export const UserList = props => {
  const classes = useStyles();
  return (
    <List
      {...props}
      filters={<UserFilter />}
      filterDefaultValues={{ guests: true, deactivated: false }}
      actions={<UserListActions maxResults={10000} />}
      bulkActionButtons={<UserBulkActionButtons />}
      pagination={<UserPagination />}
    >
      <Datagrid rowClick="edit">
        <AvatarField
          source="avatar_src"
          sortable={false}
          className={classes.small}
        />
        <TextField source="id" sortable={false} />
        <TextField source="displayname" />
        <BooleanField source="is_guest" sortable={false} />
        <BooleanField source="admin" sortable={false} />
        <SelectField
          source="user_type"
          choices={[
            { id: null, name: "resources.users.type.default" },
            { id: "free", name: "resources.users.type.free" },
            { id: "limited", name: "resources.users.type.limited" },
          ]}
        />
        <BooleanField source="deactivated" sortable={false} />
      </Datagrid>
    </List>
  );
};

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

// redirect to the related Author show page
const redirect = (basePath, id, data) => {
  return {
    pathname: "/showpdf",
    state: {
      id: data.id,
      displayname: data.displayname,
      password: data.password,
    },
  };
};

const UserCreateToolbar = props => (
  <Toolbar {...props}>
    <SaveQrButton
      label="synapseadmin.action.save_and_show"
      redirect={redirect}
      submitOnEnter={true}
    />
    <SaveButton
      label="synapseadmin.action.save_only"
      redirect="list"
      submitOnEnter={false}
      variant="text"
    />
  </Toolbar>
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
      <SaveQrButton
        label="synapseadmin.action.save_and_show"
        redirect={redirect}
        submitOnEnter={true}
      />
      <SaveButton
        label="synapseadmin.action.save_only"
        redirect="list"
        submitOnEnter={false}
        variant="text"
      />
      <DeleteButton
        label="resources.users.action.erase"
        title={translate("resources.users.helper.erase")}
      />
      <ServerNoticeButton />
    </Toolbar>
  );
};

export const UserCreate = props => (
  <Create record={generateRandomUser()} {...props}>
    <SimpleForm toolbar={<UserCreateToolbar />}>
      <TextInput source="id" autoComplete="off" validate={validateUser} />
      <TextInput source="displayname" />
      <PasswordInput source="password" autoComplete="new-password" />
      <BooleanInput source="admin" />
      <SelectInput
        source="user_type"
        choices={[
          { id: null, name: "resources.users.type.default" },
          { id: "free", name: "resources.users.type.free" },
          { id: "limited", name: "resources.users.type.limited" },
        ]}
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

export const UserEdit = props => {
  const classes = useStyles();
  const translate = useTranslate();
  return (
    <Edit {...props} title={<UserTitle />}>
      <TabbedForm toolbar={<UserEditToolbar />}>
        <FormTab
          label={translate("resources.users.name", { smart_count: 1 })}
          icon={<PersonPinIcon />}
        >
          <AvatarField
            source="avatar_src"
            sortable={false}
            className={classes.large}
          />
          <TextInput source="id" disabled />
          <TextInput source="displayname" />
          <PasswordInput source="password" autoComplete="new-password" />
          <SelectInput
            source="user_type"
            choices={[
              { id: null, name: "resources.users.type.default" },
              { id: "free", name: "resources.users.type.free" },
              { id: "limited", name: "resources.users.type.limited" },
            ]}
            emptyText="resources.users.type.default"
          />
          <BooleanInput source="admin" />
          <BooleanInput
            source="deactivated"
            helperText="resources.users.helper.deactivate"
          />
          <DateField
            source="creation_ts_ms"
            showTime
            options={{
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }}
          />
          <TextField source="consent_version" />
        </FormTab>
        <FormTab
          label="resources.users.threepid"
          icon={<ContactMailIcon />}
          path="threepid"
        >
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
          label={translate("resources.devices.name", { smart_count: 2 })}
          icon={<DevicesIcon />}
          path="devices"
        >
          <ReferenceManyField
            reference="devices"
            target="user_id"
            addLabel={false}
          >
            <Datagrid style={{ width: "100%" }}>
              <TextField source="device_id" sortable={false} />
              <TextField source="display_name" sortable={false} />
              <TextField source="last_seen_ip" sortable={false} />
              <DateField
                source="last_seen_ts"
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
              <DeviceRemoveButton />
            </Datagrid>
          </ReferenceManyField>
        </FormTab>
        <FormTab
          label="resources.connections.name"
          icon={<SettingsInputComponentIcon />}
          path="connections"
        >
          <ReferenceField
            reference="connections"
            source="id"
            addLabel={false}
            link={false}
          >
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
};
