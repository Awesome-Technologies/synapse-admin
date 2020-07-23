import React from "react";
import { connect } from "react-redux";
import {
  AutocompleteArrayInput,
  BooleanInput,
  BooleanField,
  Create,
  Datagrid,
  Filter,
  FormTab,
  List,
  Pagination,
  ReferenceArrayInput,
  SelectField,
  Show,
  Tab,
  TabbedForm,
  TabbedShowLayout,
  TextField,
  TextInput,
  useTranslate,
} from "react-admin";
import get from "lodash/get";
import { Tooltip, Typography, Chip } from "@material-ui/core";
import HttpsIcon from "@material-ui/icons/Https";
import NoEncryptionIcon from "@material-ui/icons/NoEncryption";
import PageviewIcon from "@material-ui/icons/Pageview";
import UserIcon from "@material-ui/icons/Group";
import ViewListIcon from "@material-ui/icons/ViewList";
import VisibilityIcon from "@material-ui/icons/Visibility";

const RoomPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
);

const EncryptionField = ({ source, record = {}, emptyText }) => {
  const translate = useTranslate();
  const value = get(record, source);
  let ariaLabel = value === false ? "ra.boolean.false" : "ra.boolean.true";

  if (value === false || value === true) {
    return (
      <Typography component="span" variant="body2">
        <Tooltip title={translate(ariaLabel, { _: ariaLabel })}>
          {value === true ? (
            <HttpsIcon data-testid="true" htmlColor="limegreen" />
          ) : (
            <NoEncryptionIcon data-testid="false" color="error" />
          )}
        </Tooltip>
      </Typography>
    );
  }

  return (
    <Typography component="span" variant="body2">
      {emptyText}
    </Typography>
  );
};

const validateDisplayName = fieldval =>
  fieldval === undefined
    ? "synapseadmin.rooms.room_name_required"
    : fieldval.length === 0
    ? "synapseadmin.rooms.room_name_required"
    : undefined;

function approximateAliasLength(alias, homeserver) {
  /* TODO maybe handle punycode in homeserver name */

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
  const homeserver = localStorage.getItem("home_server");

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
        <BooleanInput
          source="encrypt"
          initialValue={true}
          label="synapseadmin.rooms.encrypt"
        />
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

export const RoomShow = props => {
  const translate = useTranslate();
  return (
    <Show {...props} title={<RoomTitle />}>
      <TabbedShowLayout>
        <Tab label="synapseadmin.rooms.tabs.basic" icon={<ViewListIcon />}>
          <TextField source="room_id" />
          <TextField source="name" />
          <TextField source="canonical_alias" />
          <TextField source="creator" />
        </Tab>

        <Tab
          label="synapseadmin.rooms.tabs.detail"
          icon={<PageviewIcon />}
          path="detail"
        >
          <TextField source="joined_members" />
          <TextField source="joined_local_members" />
          <TextField source="state_events" />
          <TextField source="version" />
          <TextField
            source="encryption"
            emptyText={translate("resources.rooms.enums.unencrypted")}
          />
        </Tab>

        <Tab
          label="synapseadmin.rooms.tabs.permission"
          icon={<VisibilityIcon />}
          path="permission"
        >
          <BooleanField source="federatable" />
          <BooleanField source="public" />
          <SelectField
            source="join_rules"
            choices={[
              { id: "public", name: "resources.rooms.enums.join_rules.public" },
              { id: "knock", name: "resources.rooms.enums.join_rules.knock" },
              { id: "invite", name: "resources.rooms.enums.join_rules.invite" },
              {
                id: "private",
                name: "resources.rooms.enums.join_rules.private",
              },
            ]}
          />
          <SelectField
            source="guest_access"
            choices={[
              {
                id: "can_join",
                name: "resources.rooms.enums.guest_access.can_join",
              },
              {
                id: "forbidden",
                name: "resources.rooms.enums.guest_access.forbidden",
              },
            ]}
          />
          <SelectField
            source="history_visibility"
            choices={[
              {
                id: "invited",
                name: "resources.rooms.enums.history_visibility.invited",
              },
              {
                id: "joined",
                name: "resources.rooms.enums.history_visibility.joined",
              },
              {
                id: "shared",
                name: "resources.rooms.enums.history_visibility.shared",
              },
              {
                id: "world_readable",
                name: "resources.rooms.enums.history_visibility.world_readable",
              },
            ]}
          />
        </Tab>
      </TabbedShowLayout>
    </Show>
  );
};
const RoomFilter = ({ ...props }) => {
  const translate = useTranslate();
  return (
    <Filter {...props}>
      <Chip
        label={translate("resources.rooms.fields.joined_local_members")}
        source="joined_local_members"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
      <Chip
        label={translate("resources.rooms.fields.state_events")}
        source="state_events"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
      <Chip
        label={translate("resources.rooms.fields.version")}
        source="version"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
      <Chip
        label={translate("resources.rooms.fields.federatable")}
        source="federatable"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
    </Filter>
  );
};

const FilterableRoomList = ({ ...props }) => {
  const filter = props.roomFilters;
  const localMembersFilter =
    filter && filter.joined_local_members ? true : false;
  const stateEventsFilter = filter && filter.state_events ? true : false;
  const versionFilter = filter && filter.version ? true : false;
  const federateableFilter = filter && filter.federatable ? true : false;

  return (
    <List
      {...props}
      pagination={<RoomPagination />}
      sort={{ field: "name", order: "ASC" }}
      filters={<RoomFilter />}
    >
      <Datagrid rowClick="show">
        <EncryptionField
          source="is_encrypted"
          sortBy="encryption"
          label={<HttpsIcon />}
        />
        <TextField source="name" />
        <TextField source="joined_members" />
        {localMembersFilter && <TextField source="joined_local_members" />}
        {stateEventsFilter && <TextField source="state_events" />}
        {versionFilter && <TextField source="version" />}
        {federateableFilter && <BooleanField source="federatable" />}
        <BooleanField source="public" />
      </Datagrid>
    </List>
  );
};

function mapStateToProps(state) {
  return {
    roomFilters: state.admin.resources.rooms.list.params.displayedFilters,
  };
}

export const RoomList = connect(mapStateToProps)(FilterableRoomList);
