import EqualizerIcon from "@mui/icons-material/Equalizer";
import {
  DataTable,
  ExportButton,
  List,
  ListProps,
  NumberField,
  Pagination,
  ResourceProps,
  SearchInput,
  TopToolbar,
  useCreatePath,
  useListContext,
} from "react-admin";

import { DeleteMediaButton } from "../components/media";

export const ListActions = () => {
  const { isLoading, total } = useListContext();
  return (
    <TopToolbar>
      <DeleteMediaButton />
      <ExportButton disabled={isLoading || total === 0} />
    </TopToolbar>
  );
};

const UserMediaStatsPagination = () => <Pagination rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />;

const userMediaStatsFilters = [<SearchInput source="search_term" alwaysOn />];

export const UserMediaStatsList = (props: ListProps) => {
  const createPath = useCreatePath();

  return (
    <List
      {...props}
      actions={<ListActions />}
      filters={userMediaStatsFilters}
      pagination={<UserMediaStatsPagination />}
      sort={{ field: "media_length", order: "DESC" }}
    >
      <DataTable
        rowClick={id => `${createPath({ resource: "users", id, type: "edit" })}/media`}
        bulkActionButtons={false}
      >
        <DataTable.Col source="user_id" label="resources.users.fields.id" />
        <DataTable.Col source="displayname" label="resources.users.fields.displayname" />
        <DataTable.Col source="media_count" field={NumberField} />
        <DataTable.Col source="media_length" field={NumberField} />
      </DataTable>
    </List>
  );
};

const resource = {
  name: "user_media_statistics",
  icon: EqualizerIcon,
  list: UserMediaStatsList,
  recordRepresentation: (record: { displayname?: string; user_id: string }) => record.displayname || record.user_id,
} satisfies ResourceProps;

export default resource;
