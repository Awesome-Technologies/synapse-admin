import React, { cloneElement, Fragment } from "react";
import Avatar from "@material-ui/core/Avatar";
import AssignmentIndIcon from "@material-ui/icons/AssignmentInd";
import ContactMailIcon from "@material-ui/icons/ContactMail";
import DevicesIcon from "@material-ui/icons/Devices";
import GetAppIcon from "@material-ui/icons/GetApp";
import NotificationsIcon from "@material-ui/icons/Notifications";
import PermMediaIcon from "@material-ui/icons/PermMedia";
import PersonPinIcon from "@material-ui/icons/PersonPin";
import SettingsInputComponentIcon from "@material-ui/icons/SettingsInputComponent";
import ViewListIcon from "@material-ui/icons/ViewList";
import {
  ArrayInput,
  ArrayField,
  Button,
  CreateButton,
  Datagrid,
  DateField,
  Create,
  Edit,
  ExportButton,
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
  maxLength,
  regex,
  required,
  useTranslate,
  Pagination,
  TopToolbar,
  sanitizeListRestProps,
  NumberField,
} from "react-admin";
import { Link } from "react-router-dom";
import SaveQrButton from "./SaveQrButton";
import { ServerNoticeButton, ServerNoticeBulkButton } from "./ServerNotices";
import { DeviceRemoveButton } from "./devices";
import { ProtectMediaButton, QuarantineMediaButton } from "./media";
import { makeStyles } from "@material-ui/core/styles";

const redirect = () => {
  return {
    pathname: "/importcsv",
  };
};

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
}) => {
  return (
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
      {/* Add your custom actions */}
      <Button component={Link} to={redirect} label="CSV Import">
        <GetAppIcon style={{ transform: "rotate(180deg)", fontSize: "20" }} />
      </Button>
    </TopToolbar>
  );
};

UserListActions.defaultProps = {
  selectedIds: [],
  onUnselectItems: () => null,
};

const UserPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
);

const UserFilter = props => (
  <Filter {...props}>
    <SearchInput source="name" alwaysOn />
    <BooleanInput source="guests" alwaysOn />
    <BooleanInput
      label="resources.users.fields.show_deactivated"
      source="deactivated"
      alwaysOn
    />
  </Filter>
);

const UserBulkActionButtons = props => (
  <Fragment>
    <ServerNoticeBulkButton {...props} />
    <BulkDeleteButton
      {...props}
      label="resources.users.action.erase"
      confirmTitle="resources.users.helper.erase"
      mutationMode="pessimistic"
    />
  </Fragment>
);

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
      sort={{ field: "name", order: "ASC" }}
      actions={<UserListActions maxResults={10000} />}
      bulkActionButtons={<UserBulkActionButtons />}
      pagination={<UserPagination />}
    >
      <Datagrid rowClick="edit">
        <AvatarField
          source="avatar_src"
          className={classes.small}
          sortBy="avatar_url"
        />
        <TextField source="id" sortBy="name" />
        <TextField source="displayname" />
        <BooleanField source="is_guest" />
        <BooleanField source="admin" />
        <SelectField
          source="user_type"
          choices={[
            { id: null, name: "resources.users.type.default" },
            { id: "free", name: "resources.users.type.free" },
            { id: "limited", name: "resources.users.type.limited" },
          ]}
        />
        <BooleanField source="deactivated" />
        <DateField
          source="creation_ts"
          label="resources.users.fields.creation_ts_ms"
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
      </Datagrid>
    </List>
  );
};

const UserCreateToolbar = props => (
  <Toolbar {...props}>
    <SaveQrButton
      label="synapseadmin.action.save_and_show"
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
// here only local part of user_id
// maxLength = 255 - "@" - ":" - localStorage.getItem("home_server").length
// localStorage.getItem("home_server").length is not valid here
const validateUser = [
  required(),
  maxLength(253),
  regex(/^[a-z0-9._=\-/]+$/, "synapseadmin.users.invalid_user_id"),
];

const validateAddress = [required(), maxLength(255)];

export function generateRandomUser() {
  const user_id =
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
      .join("");

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

const UserEditToolbar = props => {
  const translate = useTranslate();
  return (
    <Toolbar {...props}>
      <SaveQrButton
        label="synapseadmin.action.save_and_show"
        submitOnEnter={true}
        disabled={props.pristine}
      />
      <SaveButton
        label="synapseadmin.action.save_only"
        redirect="list"
        submitOnEnter={false}
        disabled={props.pristine}
        variant="text"
      />
      <DeleteButton
        label="resources.users.action.erase"
        confirmTitle={translate("resources.users.helper.erase", {
          smart_count: 1,
        })}
        mutationMode="pessimistic"
      />
      <ServerNoticeButton />
    </Toolbar>
  );
};

export const UserCreate = props => (
  <Create record={generateRandomUser()} {...props}>
    <SimpleForm toolbar={<UserCreateToolbar />}>
      <TextInput source="id" autoComplete="off" validate={validateUser} />
      <TextInput source="displayname" validate={maxLength(256)} />
      <PasswordInput
        source="password"
        autoComplete="new-password"
        validate={maxLength(512)}
      />
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
            validate={required()}
          />
          <TextInput source="address" validate={validateAddress} />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="external_ids" label="synapseadmin.users.tabs.sso">
        <SimpleFormIterator>
          <TextInput source="auth_provider" validate={required()} />
          <TextInput
            source="external_id"
            label="resources.users.fields.id"
            validate={required()}
          />
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
          label="synapseadmin.users.tabs.sso"
          icon={<AssignmentIndIcon />}
          path="sso"
        >
          <ArrayInput source="external_ids" label={false}>
            <SimpleFormIterator>
              <TextInput source="auth_provider" validate={required()} />
              <TextInput
                source="external_id"
                label="resources.users.fields.id"
                validate={required()}
              />
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

        <FormTab
          label={translate("resources.users_media.name", { smart_count: 2 })}
          icon={<PermMediaIcon />}
          path="media"
        >
          <ReferenceManyField
            reference="users_media"
            target="user_id"
            addLabel={false}
            pagination={<UserPagination />}
            perPage={50}
            sort={{ field: "created_ts", order: "DESC" }}
          >
            <Datagrid style={{ width: "100%" }}>
              <DateField
                source="created_ts"
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
              <DateField
                source="last_access_ts"
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
              <TextField source="media_id" />
              <NumberField source="media_length" />
              <TextField source="media_type" />
              <TextField source="upload_name" />
              <TextField source="quarantined_by" />
              <QuarantineMediaButton label="resources.quarantine_media.action.name" />
              <ProtectMediaButton label="resources.users_media.fields.safe_from_quarantine" />
              <DeleteButton mutationMode="pessimistic" redirect={false} />
            </Datagrid>
          </ReferenceManyField>
        </FormTab>

        <FormTab
          label={translate("resources.rooms.name", { smart_count: 2 })}
          icon={<ViewListIcon />}
          path="rooms"
        >
          <ReferenceManyField
            reference="joined_rooms"
            target="user_id"
            addLabel={false}
          >
            <Datagrid
              style={{ width: "100%" }}
              rowClick={(id, basePath, record) => "/rooms/" + id + "/show"}
            >
              <TextField
                source="id"
                sortable={false}
                label="resources.rooms.fields.room_id"
              />
              <ReferenceField
                label="resources.rooms.fields.name"
                source="id"
                reference="rooms"
                sortable={false}
                link=""
              >
                <TextField source="name" sortable={false} />
              </ReferenceField>
            </Datagrid>
          </ReferenceManyField>
        </FormTab>

        <FormTab
          label={translate("resources.pushers.name", { smart_count: 2 })}
          icon={<NotificationsIcon />}
          path="pushers"
        >
          <ReferenceManyField
            reference="pushers"
            target="user_id"
            addLabel={false}
          >
            <Datagrid style={{ width: "100%" }}>
              <TextField source="kind" sortable={false} />
              <TextField source="app_display_name" sortable={false} />
              <TextField source="app_id" sortable={false} />
              <TextField source="data.url" sortable={false} />
              <TextField source="device_display_name" sortable={false} />
              <TextField source="lang" sortable={false} />
              <TextField source="profile_tag" sortable={false} />
              <TextField source="pushkey" sortable={false} />
            </Datagrid>
          </ReferenceManyField>
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};
