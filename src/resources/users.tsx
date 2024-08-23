import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import DevicesIcon from "@mui/icons-material/Devices";
import UserIcon from "@mui/icons-material/Group";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PermMediaIcon from "@mui/icons-material/PermMedia";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import ViewListIcon from "@mui/icons-material/ViewList";
import {
  ArrayInput,
  ArrayField,
  Datagrid,
  DateField,
  Edit,
  EditProps,
  List,
  ListProps,
  SimpleFormIterator,
  TabbedForm,
  FormTab,
  BooleanField,
  BooleanInput,
  TextField,
  TextInput,
  ReferenceField,
  ReferenceManyField,
  ResourceProps,
  SearchInput,
  SelectInput,
  DeleteButton,
  required,
  useRecordContext,
  useTranslate,
  Pagination,
  ExportButton,
  TopToolbar,
  NumberField,
  useListContext,
  Toolbar,
  SaveButton,
} from "react-admin";
import { Link } from "react-router-dom";

import AvatarField from "../components/AvatarField";
import { ServerNoticeButton, ServerNoticeBulkButton } from "../components/ServerNotices";
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
  const { isLoading, total } = useListContext();
  return (
    <TopToolbar>
      <ExportButton disabled={isLoading || total === 0} maxResults={10000} />
    </TopToolbar>
  );
};

UserListActions.defaultProps = {
  selectedIds: [],
  onUnselectItems: () => null,
};

const UserPagination = () => <Pagination rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />;

const userFilters = [
  <SearchInput source="name" alwaysOn />,
  <BooleanInput source="guests" alwaysOn />,
  <BooleanInput label="resources.users.fields.show_deactivated" source="deactivated" alwaysOn />,
];

const UserBulkActionButtons = () => (
  <>
    <ServerNoticeBulkButton />
  </>
);

export const UserList = (props: ListProps) => (
  <List
    {...props}
    filters={userFilters}
    filterDefaultValues={{ guests: true, deactivated: false }}
    sort={{ field: "name", order: "ASC" }}
    actions={<UserListActions />}
    pagination={<UserPagination />}
  >
    <Datagrid rowClick="edit" bulkActionButtons={<UserBulkActionButtons />}>
      <AvatarField source="avatar_src" sx={{ height: "40px", width: "40px" }} sortBy="avatar_url" />
      <TextField source="id" sortBy="name" />
      <TextField source="displayname" />
      <BooleanField source="is_guest" />
      <BooleanField source="admin" />
      <BooleanField source="deactivated" />
      <BooleanField source="locked" />
      <BooleanField source="erased" sortable={false} />
      <DateField source="creation_ts" label="resources.users.fields.creation_ts_ms" showTime options={DATE_FORMAT} />
    </Datagrid>
  </List>
);

const UserEditActions = () => {
  const record = useRecordContext();
  const translate = useTranslate();

  return (
    <TopToolbar>
      {!record?.deactivated && <ServerNoticeButton />}
    </TopToolbar>
  );
};

const UserEditToolbar = props => (
  <Toolbar {...props}>
    <SaveButton />
  </Toolbar>
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
  return (
    <Edit {...props} title={<UserTitle />} actions={<UserEditActions />}>
      <TabbedForm toolbar={<UserEditToolbar />}>
        <FormTab label={translate("resources.users.name", { smart_count: 1 })} icon={<PersonPinIcon />}>
          <AvatarField source="avatar_src" sortable={false} sx={{ height: "120px", width: "120px", float: "right" }} />
          <TextInput source="id" disabled />
          <TextInput source="displayname" />
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
            <Datagrid style={{ width: "100%" }}>
              <TextField source="device_id" sortable={false} />
              <TextField source="display_name" sortable={false} />
              <TextField source="last_seen_ip" sortable={false} />
              <DateField source="last_seen_ts" showTime options={DATE_FORMAT} sortable={false} />
              <DeviceRemoveButton />
            </Datagrid>
          </ReferenceManyField>
        </FormTab>

        <FormTab label="resources.connections.name" icon={<SettingsInputComponentIcon />} path="connections">
          <ReferenceField reference="connections" source="id" label={false} link={false}>
            <ArrayField source="devices[].sessions[0].connections" label="resources.connections.name">
              <Datagrid style={{ width: "100%" }} bulkActionButtons={false}>
                <TextField source="ip" sortable={false} />
                <DateField source="last_seen" showTime options={DATE_FORMAT} sortable={false} />
                <TextField source="user_agent" sortable={false} style={{ width: "100%" }} />
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
            label={false}
            pagination={<UserPagination />}
            perPage={50}
            sort={{ field: "created_ts", order: "DESC" }}
          >
            <Datagrid style={{ width: "100%" }}>
              <MediaIDField source="media_id" />
              <DateField source="created_ts" showTime options={DATE_FORMAT} />
              <DateField source="last_access_ts" showTime options={DATE_FORMAT} />
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

        <FormTab label={translate("resources.rooms.name", { smart_count: 2 })} icon={<ViewListIcon />} path="rooms">
          <ReferenceManyField reference="joined_rooms" target="user_id" label={false}>
            <Datagrid style={{ width: "100%" }} rowClick={id => "/rooms/" + id + "/show"} bulkActionButtons={false}>
              <TextField source="id" sortable={false} label="resources.rooms.fields.room_id" />
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
          <ReferenceManyField reference="pushers" target="user_id" label={false}>
            <Datagrid style={{ width: "100%" }} bulkActionButtons={false}>
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

const resource: ResourceProps = {
  name: "users",
  icon: UserIcon,
  list: UserList,
  edit: UserEdit,
};

export default resource;
