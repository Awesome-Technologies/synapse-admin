import React, { Fragment } from "react";
import { connect } from "react-redux";
import { Route, Link } from "react-router-dom";
import {
  AutocompleteArrayInput,
  AutocompleteInput,
  BooleanInput,
  BooleanField,
  BulkDeleteWithConfirmButton,
  Button,
  Create,
  Edit,
  Datagrid,
  DeleteButton,
  Filter,
  FormTab,
  List,
  Pagination,
  ReferenceArrayInput,
  ReferenceField,
  ReferenceInput,
  ReferenceManyField,
  SearchInput,
  SelectField,
  Show,
  SimpleForm,
  Tab,
  TabbedForm,
  TabbedShowLayout,
  TextField,
  TextInput,
  Toolbar,
  TopToolbar,
  useDataProvider,
  useRefresh,
  useTranslate,
} from "react-admin";
import get from "lodash/get";
import {
  Tooltip,
  Typography,
  Chip,
  Drawer,
  styled,
  withStyles,
  Select,
  MenuItem,
} from "@material-ui/core";
import HttpsIcon from "@material-ui/icons/Https";
import NoEncryptionIcon from "@material-ui/icons/NoEncryption";
import PageviewIcon from "@material-ui/icons/Pageview";
import UserIcon from "@material-ui/icons/Group";
import ViewListIcon from "@material-ui/icons/ViewList";
import VisibilityIcon from "@material-ui/icons/Visibility";
import ContentSave from "@material-ui/icons/Save";

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

const validateDisplayName = fieldval => {
  return fieldval == null
    ? "synapseadmin.rooms.room_name_required"
    : fieldval.length === 0
    ? "synapseadmin.rooms.room_name_required"
    : undefined;
};

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
        <ReferenceInput
          reference="users"
          source="owner"
          filterToQuery={searchText => ({ user_id: searchText })}
        >
          <AutocompleteInput
            optionText="displayname"
            suggestionText="displayname"
          />
        </ReferenceInput>
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

// Explicitely passing "to" prop
// Toolbar adds all kinds of unsupported props to its children :(
const StyledLink = styles => {
  const Styled = styled(Link)(styles);
  return ({ to, children }) => <Styled to={to}>{children}</Styled>;
};

const RoomMemberEditToolbar = ({ backLink, translate, onSave, ...props }) => {
  const SaveLink = StyledLink({
    textDecoration: "none",
  });
  const CancelLink = StyledLink({
    textDecoration: "none",
    marginLeft: "1em",
  });
  const SaveIcon = styled(ContentSave)({
    width: "1rem",
    marginRight: "0.25em",
  });

  return (
    <Toolbar {...props}>
      <SaveLink to={backLink}>
        <Button onClick={onSave} variant="contained">
          <React.Fragment>
            <SaveIcon />
            {translate("ra.action.save")}
          </React.Fragment>
        </Button>
      </SaveLink>
      <CancelLink to={backLink}>
        <Button>
          <React.Fragment>{translate("ra.action.cancel")}</React.Fragment>
        </Button>
      </CancelLink>
    </Toolbar>
  );
};

const RoomMemberIdField = ({ memberId, data = {} }) => {
  const value = get(data[memberId], "id");

  return (
    <Typography component="span" variant="body2">
      {value}
    </Typography>
  );
};

const RoomMemberRoleInput = ({ memberId, data = {}, translate, onChange }) => {
  const roleValue = get(data[memberId], "role");
  const [role, setRole] = React.useState(roleValue);

  React.useEffect(() => {
    onChange(roleValue);
  }, [onChange, roleValue]);

  return (
    <React.Fragment>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={role}
        onChange={event => {
          setRole(event.target.value);
          onChange(event.target.value);
        }}
      >
        <MenuItem value={"user"}>
          {translate("resources.users.roles.user")}
        </MenuItem>
        <MenuItem value={"mod"}>
          {translate("resources.users.roles.mod")}
        </MenuItem>
        <MenuItem value={"admin"}>
          {translate("resources.users.roles.admin")}
        </MenuItem>
      </Select>
    </React.Fragment>
  );
};

const RoomMemberEdit = ({ backLink, memberId, ...props }) => {
  const translate = useTranslate();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();

  const [role, setRole] = React.useState();

  const { id } = props;

  return (
    <Edit title=" " {...props}>
      <SimpleForm
        toolbar={
          <RoomMemberEditToolbar
            backLink={backLink}
            translate={translate}
            onSave={() => {
              dataProvider
                .update("rooms", {
                  data: {
                    id,
                    member_roles: [{ member_id: memberId, role }],
                  },
                })
                .then(() => {
                  refresh();
                });
            }}
          />
        }
      >
        <ReferenceManyField
          reference="room_members"
          target="room_id"
          label="resources.users.fields.id"
        >
          <RoomMemberIdField memberId={memberId} />
        </ReferenceManyField>
        <ReferenceManyField
          reference="room_members"
          target="room_id"
          label="resources.users.fields.role"
        >
          <RoomMemberRoleInput
            memberId={memberId}
            translate={translate}
            onChange={setRole}
          />
        </ReferenceManyField>
      </SimpleForm>
    </Edit>
  );
};

const drawerStyles = {
  paper: {
    width: 300,
  },
};
const StyledDrawer = withStyles(drawerStyles)(({ classes, ...props }) => (
  <Drawer {...props} classes={classes} />
));

export const RoomEdit = props => {
  const translate = useTranslate();

  return (
    <React.Fragment>
      <Edit {...props} title={<RoomTitle />}>
        <TabbedForm>
          <FormTab label="synapseadmin.rooms.tabs.members" icon={<UserIcon />}>
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

            <ReferenceManyField
              reference="room_members"
              target="room_id"
              addLabel={false}
            >
              <Datagrid
                style={{ width: "100%" }}
                rowClick={(id, basePath, record) =>
                  `/rooms/${encodeURIComponent(
                    record.parentId
                  )}/${encodeURIComponent(id)}`
                }
              >
                <TextField
                  source="id"
                  sortable={false}
                  label="resources.users.fields.id"
                />
                <ReferenceField
                  label="resources.users.fields.displayname"
                  source="id"
                  reference="users"
                  sortable={false}
                  link=""
                >
                  <TextField source="displayname" sortable={false} />
                </ReferenceField>
                <SelectField
                  source="role"
                  label="resources.users.fields.role"
                  choices={[
                    {
                      id: "user",
                      name: translate("resources.users.roles.user"),
                    },
                    { id: "mod", name: translate("resources.users.roles.mod") },
                    {
                      id: "admin",
                      name: translate("resources.users.roles.admin"),
                    },
                  ]}
                />
              </Datagrid>
            </ReferenceManyField>
          </FormTab>
        </TabbedForm>
      </Edit>
      <Route path="/rooms/:roomId/:memberId">
        {({ match }) => {
          const isMatch = !!match && !!match.params;

          return (
            <StyledDrawer open={isMatch} anchor="right">
              {isMatch ? (
                <RoomMemberEdit
                  {...props}
                  memberId={
                    isMatch ? decodeURIComponent(match.params.memberId) : null
                  }
                  backLink={`/rooms/${match.params.roomId}`}
                />
              ) : (
                <div />
              )}
            </StyledDrawer>
          );
        }}
      </Route>
    </React.Fragment>
  );
};

const RoomShowActions = ({ basePath, data, resource }) => {
  const translate = useTranslate();
  return (
    <TopToolbar>
      <DeleteButton
        basePath={basePath}
        record={data}
        resource={resource}
        undoable={false}
        confirmTitle={translate("synapseadmin.rooms.delete.title")}
        confirmContent={translate("synapseadmin.rooms.delete.message")}
      />
    </TopToolbar>
  );
};

export const RoomShow = props => {
  const translate = useTranslate();
  return (
    <Show {...props} actions={<RoomShowActions />} title={<RoomTitle />}>
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

        <Tab label="synapseadmin.rooms.tabs.members" icon={<UserIcon />}>
          <ReferenceManyField
            reference="room_members"
            target="room_id"
            addLabel={false}
          >
            <Datagrid
              style={{ width: "100%" }}
              rowClick={(id, basePath, record) => "/users/" + id}
            >
              <TextField
                source="id"
                sortable={false}
                label="resources.users.fields.id"
              />
              <ReferenceField
                label="resources.users.fields.displayname"
                source="id"
                reference="users"
                sortable={false}
                link=""
              >
                <TextField source="displayname" sortable={false} />
              </ReferenceField>
            </Datagrid>
          </ReferenceManyField>
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

const RoomBulkActionButtons = props => (
  <Fragment>
    <BulkDeleteWithConfirmButton {...props} />
  </Fragment>
);

const RoomFilter = ({ ...props }) => {
  const translate = useTranslate();
  return (
    <Filter {...props}>
      <SearchInput source="search_term" alwaysOn />
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
  const translate = useTranslate();

  return (
    <List
      {...props}
      pagination={<RoomPagination />}
      sort={{ field: "name", order: "ASC" }}
      filters={<RoomFilter />}
      bulkActionButtons={
        <RoomBulkActionButtons
          confirmTitle={translate("synapseadmin.rooms.delete.title")}
          confirmContent={translate("synapseadmin.rooms.delete.message")}
        />
      }
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
