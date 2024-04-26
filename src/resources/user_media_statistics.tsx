import EqualizerIcon from "@mui/icons-material/Equalizer";
import {
  Datagrid,
  ExportButton,
  List,
  ListProps,
  NumberField,
  Pagination,
  ResourceProps,
  SearchInput,
  TextField,
  TopToolbar,
  useListContext,
} from "react-admin";

import { DeleteMediaButton } from "../components/media";

const ListActions = () => {
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

export const UserMediaStatsList = (props: ListProps) => (
  <List
    {...props}
    actions={<ListActions />}
    filters={userMediaStatsFilters}
    pagination={<UserMediaStatsPagination />}
    sort={{ field: "media_length", order: "DESC" }}
  >
    <Datagrid rowClick={id => "/users/" + id + "/media"} bulkActionButtons={false}>
      <TextField source="user_id" label="resources.users.fields.id" />
      <TextField source="displayname" label="resources.users.fields.displayname" />
      <NumberField source="media_count" />
      <NumberField source="media_length" />
    </Datagrid>
  </List>
);

const resource: ResourceProps = {
  name: "user_media_statistics",
  icon: EqualizerIcon,
  list: UserMediaStatsList,
};

export default resource;
