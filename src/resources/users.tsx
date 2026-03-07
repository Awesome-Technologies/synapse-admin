import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import DevicesIcon from "@mui/icons-material/Devices";
import GetAppIcon from "@mui/icons-material/GetApp";
import UserIcon from "@mui/icons-material/Group";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PermMediaIcon from "@mui/icons-material/PermMedia";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import ViewListIcon from "@mui/icons-material/ViewList";
import {
  ArrayField,
  ArrayInput,
  BooleanField,
  BooleanInput,
  BulkDeleteButton,
  Button,
  Create,
  CreateButton,
  CreateProps,
  DataTable,
  DateField,
  DeleteButton,
  Edit,
  EditProps,
  ExportButton,
  FormTab,
  List,
  ListProps,
  NumberField,
  Pagination,
  PasswordInput,
  ReferenceField,
  ReferenceManyField,
  ResourceProps,
  SearchInput,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
  TopToolbar,
  maxLength,
  regex,
  required,
  useCreatePath,
  useListContext,
  useRecordContext,
  useTranslate,
} from "react-admin";

import AvatarField from "../components/AvatarField";
import { ServerNoticeBulkButton, ServerNoticeButton } from "../components/ServerNotices";
import { DATE_FORMAT } from "../components/date";
import { DeviceRemoveButton } from "../components/devices";
import { MediaIDField, ProtectMediaButton, QuarantineMediaButton } from "../components/media";

const choices_medium = [
  { id: "email", name: "resources.users.email" },
  { id: "msisdn", name: "resources.users.msisdn" },
];

const choices_type = [
  { id: "bot", name: "bot" },
  { id: "support", name: "support" },
];

const UserListActions = () => {
  const { isPending, total } = useListContext();

  return (
    <TopToolbar>
      <CreateButton />
      <ExportButton disabled={isPending || total === 0} maxResults={10000} />
      <Button to="/import_users" label="CSV Import">
        <GetAppIcon sx={{ transform: "rotate(180deg)", fontSize: "20px" }} />
      </Button>
    </TopToolbar>
  );
};

const UserPagination = () => <Pagination rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />;

const userFilters = [
  <SearchInput source="name" alwaysOn />,
  <BooleanInput source="guests" alwaysOn />,
  <BooleanInput label="resources.users.fields.show_deactivated" source="deactivated" alwaysOn />,
  <BooleanInput label="resources.users.fields.show_locked" source="locked" alwaysOn />,
];

const UserBulkActionButtons = () => (
  <>
    <ServerNoticeBulkButton />
    <BulkDeleteButton
      label="resources.users.action.erase"
      confirmTitle="resources.users.helper.erase"
      mutationMode="pessimistic"
    />
  </>
);

export const UserList = (props: ListProps) => (
  <List
    {...props}
    filters={userFilters}
    filterDefaultValues={{ guests: true, deactivated: false, locked: false }}
    sort={{ field: "name", order: "ASC" }}
    actions={<UserListActions />}
    pagination={<UserPagination />}
  >
    <DataTable bulkActionButtons={<UserBulkActionButtons />} rowClick="edit">
      <DataTable.Col source="avatar_src" label="resources.users.fields.avatar">
        <AvatarField source="avatar_src" sx={{ height: "40px", width: "40px" }} />
      </DataTable.Col>
      <DataTable.Col source="id" />
      <DataTable.Col source="displayname" />
      <DataTable.Col source="is_guest" field={BooleanField} />
      <DataTable.Col source="admin" field={BooleanField} />
      <DataTable.Col source="deactivated" field={BooleanField} />
      <DataTable.Col source="locked" field={BooleanField} />
      <DataTable.Col source="erased" field={BooleanField} />
      <DataTable.Col source="creation_ts" label="resources.users.fields.creation_ts_ms">
        <DateField source="creation_ts" showTime options={DATE_FORMAT} />
      </DataTable.Col>
    </DataTable>
  </List>
);

const validateUser = [required(), maxLength(253), regex(/^[a-z0-9._=\-/]+$/, "synapseadmin.users.invalid_user_id")];
const validateAddress = [required(), maxLength(255)];

const UserEditActions = () => {
  const record = useRecordContext();
  const translate = useTranslate();

  return (
    <TopToolbar>
      {!record?.deactivated && <ServerNoticeButton />}
      <DeleteButton
        label="resources.users.action.erase"
        confirmTitle={translate("resources.users.helper.erase", {
          smart_count: 1,
        })}
        mutationMode="pessimistic"
      />
    </TopToolbar>
  );
};

export const UserCreate = (props: CreateProps) => (
  <Create {...props} redirect="edit">
    <SimpleForm>
      <TextInput source="id" autoComplete="off" validate={validateUser} />
      <TextInput source="displayname" validate={maxLength(256)} />
      <PasswordInput source="password" autoComplete="new-password" validate={maxLength(512)} />
      <SelectInput source="user_type" choices={choices_type} translateChoice={false} resettable />
      <BooleanInput source="admin" />
      <ArrayInput source="threepids">
        <SimpleFormIterator disableReordering>
          <SelectInput source="medium" choices={choices_medium} validate={required()} />
          <TextInput source="address" validate={validateAddress} />
        </SimpleFormIterator>
      </ArrayInput>
      <ArrayInput source="external_ids" label="synapseadmin.users.tabs.sso">
        <SimpleFormIterator disableReordering>
          <TextInput source="auth_provider" validate={required()} />
          <TextInput source="external_id" label="resources.users.fields.id" validate={required()} />
        </SimpleFormIterator>
      </ArrayInput>
    </SimpleForm>
  </Create>
);

const UserTitle = () => {
  const record = useRecordContext();
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

export const UserEdit = (props: EditProps) => {
  const translate = useTranslate();
  const createPath = useCreatePath();

  return (
    <Edit {...props} title={<UserTitle />} actions={<UserEditActions />}>
      <TabbedForm>
        <FormTab label={translate("resources.users.name", { smart_count: 1 })} icon={<PersonPinIcon />}>
          <AvatarField source="avatar_src" sortable={false} sx={{ height: "120px", width: "120px", float: "right" }} />
          <TextInput source="id" disabled />
          <TextInput source="displayname" />
          <PasswordInput source="password" autoComplete="new-password" helperText="resources.users.helper.password" />
          <SelectInput source="user_type" choices={choices_type} translateChoice={false} resettable />
          <BooleanInput source="admin" />
          <BooleanInput source="locked" />
          <BooleanInput source="deactivated" helperText="resources.users.helper.deactivate" />
          <BooleanInput source="erased" disabled />
          <DateField source="creation_ts_ms" showTime options={DATE_FORMAT} />
          <TextField source="consent_version" />
        </FormTab>

        <FormTab label="resources.users.threepid" icon={<ContactMailIcon />} path="threepid">
          <ArrayInput source="threepids">
            <SimpleFormIterator disableReordering>
              <SelectInput source="medium" choices={choices_medium} />
              <TextInput source="address" />
            </SimpleFormIterator>
          </ArrayInput>
        </FormTab>

        <FormTab label="synapseadmin.users.tabs.sso" icon={<AssignmentIndIcon />} path="sso">
          <ArrayInput source="external_ids" label={false}>
            <SimpleFormIterator disableReordering>
              <TextInput source="auth_provider" validate={required()} />
              <TextInput source="external_id" label="resources.users.fields.id" validate={required()} />
            </SimpleFormIterator>
          </ArrayInput>
        </FormTab>

        <FormTab label={translate("resources.devices.name", { smart_count: 2 })} icon={<DevicesIcon />} path="devices">
          <ReferenceManyField reference="devices" target="user_id" label={false}>
            <DataTable>
              <DataTable.Col source="device_id" />
              <DataTable.Col source="display_name" />
              <DataTable.Col source="last_seen_ip" />
              <DataTable.Col source="last_seen_ts">
                <DateField source="last_seen_ts" showTime options={DATE_FORMAT} />
              </DataTable.Col>
              <DataTable.Col>
                <DeviceRemoveButton />
              </DataTable.Col>
            </DataTable>
          </ReferenceManyField>
        </FormTab>

        <FormTab label="resources.connections.name" icon={<SettingsInputComponentIcon />} path="connections">
          <ReferenceField reference="connections" source="id" label={false} link={false}>
            <ArrayField source="devices[].sessions[0].connections" label="resources.connections.name">
              <DataTable bulkActionButtons={false}>
                <DataTable.Col source="ip" />
                <DataTable.Col source="last_seen">
                  <DateField source="last_seen" showTime options={DATE_FORMAT} />
                </DataTable.Col>
                <DataTable.Col source="user_agent" />
              </DataTable>
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
            label={false}
            pagination={<UserPagination />}
            perPage={50}
            sort={{ field: "created_ts", order: "DESC" }}
          >
            <DataTable>
              <DataTable.Col source="media_id" field={MediaIDField} />
              <DataTable.Col source="created_ts">
                <DateField source="created_ts" showTime options={DATE_FORMAT} />
              </DataTable.Col>
              <DataTable.Col source="last_access_ts">
                <DateField source="last_access_ts" showTime options={DATE_FORMAT} />
              </DataTable.Col>
              <DataTable.Col source="media_length" field={NumberField} />
              <DataTable.Col source="media_type" />
              <DataTable.Col source="upload_name" />
              <DataTable.Col source="quarantined_by" />
              <DataTable.Col label="resources.quarantine_media.action.name">
                <QuarantineMediaButton label="resources.quarantine_media.action.name" />
              </DataTable.Col>
              <DataTable.Col label="resources.users_media.fields.safe_from_quarantine">
                <ProtectMediaButton label="resources.users_media.fields.safe_from_quarantine" />
              </DataTable.Col>
              <DataTable.Col>
                <DeleteButton mutationMode="pessimistic" redirect={false} />
              </DataTable.Col>
            </DataTable>
          </ReferenceManyField>
        </FormTab>

        <FormTab label={translate("resources.rooms.name", { smart_count: 2 })} icon={<ViewListIcon />} path="rooms">
          <ReferenceManyField reference="joined_rooms" target="user_id" label={false}>
            <DataTable
              rowClick={id => createPath({ resource: "rooms", id, type: "show" })}
              bulkActionButtons={false}
            >
              <DataTable.Col source="id" label="resources.rooms.fields.room_id" />
              <DataTable.Col label="resources.rooms.fields.name">
                <ReferenceField source="id" reference="rooms" link={false}>
                  <TextField source="name" />
                </ReferenceField>
              </DataTable.Col>
            </DataTable>
          </ReferenceManyField>
        </FormTab>

        <FormTab
          label={translate("resources.pushers.name", { smart_count: 2 })}
          icon={<NotificationsIcon />}
          path="pushers"
        >
          <ReferenceManyField reference="pushers" target="user_id" label={false}>
            <DataTable bulkActionButtons={false}>
              <DataTable.Col source="kind" />
              <DataTable.Col source="app_display_name" />
              <DataTable.Col source="app_id" />
              <DataTable.Col source="data.url" />
              <DataTable.Col source="device_display_name" />
              <DataTable.Col source="lang" />
              <DataTable.Col source="profile_tag" />
              <DataTable.Col source="pushkey" />
            </DataTable>
          </ReferenceManyField>
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};

const resource = {
  name: "users",
  icon: UserIcon,
  list: UserList,
  edit: UserEdit,
  create: UserCreate,
  recordRepresentation: (record: { displayname?: string; id: string }) => record.displayname || record.id,
} satisfies ResourceProps;

export default resource;
