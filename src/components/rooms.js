import React, { Fragment, useState } from "react";
import classnames from "classnames";
import { fade } from "@material-ui/core/styles/colorManipulator";
import { connect } from "react-redux";
import {
  BooleanField,
  BulkDeleteButton,
  DateField,
  Datagrid,
  DeleteButton,
  Filter,
  List,
  NumberField,
  Pagination,
  ReferenceField,
  ReferenceManyField,
  SearchInput,
  SelectField,
  Show,
  Tab,
  TabbedShowLayout,
  TextField,
  TopToolbar,
  useRecordContext,
  useTranslate,
  useRedirect,
  Toolbar,
  SaveButton,
  Button,
  SimpleForm,
  BooleanInput,
  useDelete,
  useNotify,
} from "react-admin";
import get from "lodash/get";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { Tooltip, Typography, Chip } from "@material-ui/core";
import FastForwardIcon from "@material-ui/icons/FastForward";
import HttpsIcon from "@material-ui/icons/Https";
import NoEncryptionIcon from "@material-ui/icons/NoEncryption";
import PageviewIcon from "@material-ui/icons/Pageview";
import UserIcon from "@material-ui/icons/Group";
import ViewListIcon from "@material-ui/icons/ViewList";
import VisibilityIcon from "@material-ui/icons/Visibility";
import IconCancel from "@material-ui/icons/Cancel";
import EventIcon from "@material-ui/icons/Event";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import DeleteIcon from "@material-ui/icons/Delete";
import {
  RoomDirectoryBulkDeleteButton,
  RoomDirectoryBulkSaveButton,
  RoomDirectoryDeleteButton,
  RoomDirectorySaveButton,
} from "./RoomDirectory";

const useStyles = makeStyles(theme => ({
  helper_forward_extremities: {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    margin: "0.5em",
  },
  deleteButton: {
    color: theme.palette.error.main,
    "&:hover": {
      backgroundColor: fade(theme.palette.error.main, 0.12),
      // Reset on mouse devices
      "@media (hover: none)": {
        backgroundColor: "transparent",
      },
    },
  },
}));

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

const RoomTitle = ({ record }) => {
  const translate = useTranslate();
  var name = "";
  if (record) {
    name = record.name !== "" ? record.name : record.id;
  }

  return (
    <span>
      {translate("resources.rooms.name", 1)} {name}
    </span>
  );
};

const RoomShowActions = ({ basePath, data, resource }) => {
  var roomDirectoryStatus = "";
  if (data) {
    roomDirectoryStatus = data.public;
  }

  return (
    <TopToolbar>
      {roomDirectoryStatus === false && (
        <RoomDirectorySaveButton record={data} />
      )}
      {roomDirectoryStatus === true && (
        <RoomDirectoryDeleteButton record={data} />
      )}
      <DeleteRoomButton record={data} />
    </TopToolbar>
  );
};

export const RoomShow = props => {
  const classes = useStyles({ props });
  const translate = useTranslate();
  return (
    <Show {...props} actions={<RoomShowActions />} title={<RoomTitle />}>
      <TabbedShowLayout>
        <Tab label="synapseadmin.rooms.tabs.basic" icon={<ViewListIcon />}>
          <TextField source="room_id" />
          <TextField source="name" />
          <TextField source="canonical_alias" />
          <ReferenceField source="creator" reference="users">
            <TextField source="id" />
          </ReferenceField>
        </Tab>

        <Tab
          label="synapseadmin.rooms.tabs.detail"
          icon={<PageviewIcon />}
          path="detail"
        >
          <TextField source="joined_members" />
          <TextField source="joined_local_members" />
          <TextField source="joined_local_devices" />
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

        <Tab
          label={translate("resources.room_state.name", { smart_count: 2 })}
          icon={<EventIcon />}
          path="state"
        >
          <ReferenceManyField
            reference="room_state"
            target="room_id"
            addLabel={false}
          >
            <Datagrid style={{ width: "100%" }}>
              <TextField source="type" sortable={false} />
              <DateField
                source="origin_server_ts"
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
              <TextField source="content" sortable={false} />
              <ReferenceField
                source="sender"
                reference="users"
                sortable={false}
              >
                <TextField source="id" />
              </ReferenceField>
            </Datagrid>
          </ReferenceManyField>
        </Tab>

        <Tab
          label="resources.forward_extremities.name"
          icon={<FastForwardIcon />}
          path="forward_extremities"
        >
          <div className={classes.helper_forward_extremities}>
            {translate("resources.rooms.helper.forward_extremities")}
          </div>
          <ReferenceManyField
            reference="forward_extremities"
            target="room_id"
            addLabel={false}
          >
            <Datagrid style={{ width: "100%" }}>
              <TextField source="id" sortable={false} />
              <DateField
                source="received_ts"
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
              <NumberField source="depth" sortable={false} />
              <TextField source="state_group" sortable={false} />
            </Datagrid>
          </ReferenceManyField>
        </Tab>
      </TabbedShowLayout>
    </Show>
  );
};

const RoomBulkActionButtons = props => (
  <Fragment>
    <RoomDirectoryBulkSaveButton {...props} />
    <RoomDirectoryBulkDeleteButton {...props} />
    <BulkDeleteButton
      {...props}
      confirmTitle="resources.rooms.action.erase.title"
      confirmContent="resources.rooms.action.erase.content"
      undoable={false}
    />
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

const RoomNameField = props => {
  const { source } = props;
  const record = useRecordContext(props);
  return (
    <span>{record[source] || record["canonical_alias"] || record["id"]}</span>
  );
};

RoomNameField.propTypes = {
  label: PropTypes.string,
  record: PropTypes.object,
  source: PropTypes.string.isRequired,
};

const FilterableRoomList = ({ roomFilters, dispatch, ...props }) => {
  const filter = roomFilters;
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
      bulkActionButtons={<RoomBulkActionButtons />}
    >
      <Datagrid rowClick="show">
        <EncryptionField
          source="is_encrypted"
          sortBy="encryption"
          label={<HttpsIcon />}
        />
        <RoomNameField source="name" />
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

const DeleteRoomDialog = ({ open, loading, onClose, onSend }) => {
  const translate = useTranslate();

  const DeleteRoomToolbar = props => {
    return (
      <Toolbar {...props}>
        <SaveButton
          label="resources.rooms.action.erase.title"
          icon={<DeleteIcon />}
        />
        <Button label="ra.action.cancel" onClick={onClose}>
          <IconCancel />
        </Button>
      </Toolbar>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} loading={loading}>
      <DialogTitle>
        {translate("resources.rooms.action.erase.title")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {translate("resources.rooms.action.erase.content")}
        </DialogContentText>
        <SimpleForm
          toolbar={<DeleteRoomToolbar />}
          submitOnEnter={false}
          redirect={false}
          save={onSend}
        >
          <BooleanInput
            fullWidth
            source="block"
            label="resources.rooms.action.erase.fields.block"
            defaultValue={true}
          />
        </SimpleForm>
      </DialogContent>
    </Dialog>
  );
};

export const DeleteRoomButton = props => {
  const classes = useStyles(props);
  const [open, setOpen] = useState(false);
  const notify = useNotify();
  const redirect = useRedirect();
  const [deleteOne, { loading }] = useDelete("rooms");
  const record = useRecordContext(props);

  const handleDialogOpen = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);

  const handleSend = values => {
    deleteOne(
      { payload: { id: record.id, ...values } },
      {
        onSuccess: () => {
          notify("resources.rooms.action.erase.send_success");
          handleDialogClose();
          redirect('/rooms');
        },
        onFailure: () =>
          notify("resources.rooms.action.erase.send_failure", "error"),
      }
    );
  };

  return (
    <Fragment>
      <Button
        label="resources.rooms.action.erase.title"
        onClick={handleDialogOpen}
        disabled={loading}
        className={classnames("ra-delete-button", classes.deleteButton)}
      >
        <DeleteIcon />
      </Button>
      <DeleteRoomDialog
        open={open}
        onClose={handleDialogClose}
        onSend={handleSend}
      />
    </Fragment>
  );
};
