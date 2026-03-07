import AutorenewIcon from "@mui/icons-material/Autorenew";
import DestinationsIcon from "@mui/icons-material/CloudQueue";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import ViewListIcon from "@mui/icons-material/ViewList";
import { lighten, useTheme } from "@mui/material";
import { blue } from "@mui/material/colors";
import { get } from "lodash";
import { MouseEvent } from "react";
import {
  Button,
  DataTable,
  DateField,
  DateFieldProps,
  List,
  ListProps,
  Pagination,
  RaRecord,
  ReferenceField,
  ReferenceManyField,
  ResourceProps,
  SearchInput,
  Show,
  ShowProps,
  Tab,
  TabbedShowLayout,
  TextField,
  TopToolbar,
  useCreatePath,
  useDelete,
  useNotify,
  useRecordContext,
  useRefresh,
  useTranslate,
} from "react-admin";

import { DATE_FORMAT } from "../components/date";

const DestinationPagination = () => <Pagination rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />;
const destinationFilters = [<SearchInput source="destination" alwaysOn />];

export const DestinationReconnectButton = () => {
  const record = useRecordContext();
  const refresh = useRefresh();
  const notify = useNotify();
  const [handleReconnect, { isPending }] = useDelete();

  if (!record || !record.failure_ts) return null;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    handleReconnect(
      "destinations",
      { id: record.id },
      {
        onSuccess: () => {
          notify("ra.notification.updated", { messageArgs: { smart_count: 1 } });
          refresh();
        },
        onError: () => {
          notify("ra.message.error", { type: "error" });
        },
      }
    );
  };

  return (
    <Button label="resources.destinations.action.reconnect" onClick={handleClick} disabled={isPending}>
      <AutorenewIcon />
    </Button>
  );
};

const DestinationShowActions = () => (
  <TopToolbar>
    <DestinationReconnectButton />
  </TopToolbar>
);

const DestinationTitle = () => {
  const record = useRecordContext();
  const translate = useTranslate();

  return (
    <span>
      {translate("resources.destinations.name", { smart_count: 1 })} {record?.destination}
    </span>
  );
};

const RetryDateField = (props: DateFieldProps) => {
  const record = useRecordContext(props);

  if (props.source && get(record, props.source) === 0) {
    return <DateField {...props} record={{ ...record, [props.source]: null }} />;
  }

  return <DateField {...props} />;
};

export const DestinationList = (props: ListProps) => {
  const {
    palette: { error, mode },
  } = useTheme();

  const destinationRowSx = (record: RaRecord) => ({
    backgroundColor: record.retry_last_ts > 0 ? lighten(error[mode], 0.5) : undefined,
    "& > td": mode === "dark"
      ? {
          color: record.retry_last_ts > 0 ? "black" : "white",
          "& > button": {
            color: blue[700],
          },
        }
      : undefined,
  });

  return (
    <List
      {...props}
      filters={destinationFilters}
      pagination={<DestinationPagination />}
      sort={{ field: "destination", order: "ASC" }}
    >
      <DataTable rowSx={destinationRowSx} rowClick="show" bulkActionButtons={false}>
        <DataTable.Col source="destination" />
        <DataTable.Col source="failure_ts">
          <DateField source="failure_ts" showTime options={DATE_FORMAT} />
        </DataTable.Col>
        <DataTable.Col source="retry_last_ts">
          <RetryDateField source="retry_last_ts" showTime options={DATE_FORMAT} />
        </DataTable.Col>
        <DataTable.Col source="retry_interval" />
        <DataTable.Col source="last_successful_stream_ordering" />
        <DataTable.Col label="resources.destinations.action.reconnect">
          <DestinationReconnectButton />
        </DataTable.Col>
      </DataTable>
    </List>
  );
};

export const DestinationShow = (props: ShowProps) => {
  const translate = useTranslate();
  const createPath = useCreatePath();

  return (
    <Show actions={<DestinationShowActions />} title={<DestinationTitle />} {...props}>
      <TabbedShowLayout>
        <Tab label="status" icon={<ViewListIcon />}>
          <TextField source="destination" />
          <DateField source="failure_ts" showTime options={DATE_FORMAT} />
          <DateField source="retry_last_ts" showTime options={DATE_FORMAT} />
          <TextField source="retry_interval" />
          <TextField source="last_successful_stream_ordering" />
        </Tab>

        <Tab label={translate("resources.rooms.name", { smart_count: 2 })} icon={<FolderSharedIcon />} path="rooms">
          <ReferenceManyField
            reference="destination_rooms"
            target="destination"
            label={false}
            pagination={<DestinationPagination />}
            perPage={50}
          >
            <DataTable rowClick={id => createPath({ resource: "rooms", id, type: "show" })}>
              <DataTable.Col source="room_id" label="resources.rooms.fields.room_id" />
              <DataTable.Col source="stream_ordering" />
              <DataTable.Col label="resources.rooms.fields.name">
                <ReferenceField source="id" reference="rooms" link={false}>
                  <TextField source="name" />
                </ReferenceField>
              </DataTable.Col>
            </DataTable>
          </ReferenceManyField>
        </Tab>
      </TabbedShowLayout>
    </Show>
  );
};

const resource = {
  name: "destinations",
  icon: DestinationsIcon,
  list: DestinationList,
  show: DestinationShow,
  recordRepresentation: (record: { destination: string }) => record.destination,
} satisfies ResourceProps;

export default resource;
