import { List, Datagrid, TextField, ChipField } from "react-admin";
import Pagination from "../components/Pagination";

const TITLE = "Products";

export const ProductsList = (props) => (
  <List {...props} title={TITLE} pagination={<Pagination />} perPage={25}>
    <Datagrid bulkActionButtons={false}>
      <TextField source="id" />
      <TextField source="category" />
      <ChipField source="name" />
    </Datagrid>
  </List>
);
