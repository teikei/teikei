import { List, Datagrid, TextField, ChipField } from 'react-admin'
import Pagination from '../components/Pagination'

const TITLE = 'Products'

export const ProductsList = (props) => (
  <List
    {...props}
    title={TITLE}
    bulkActionButtons={false}
    pagination={<Pagination />}
  >
    <Datagrid>
      <TextField source="id" />
      <TextField source="category" />
      <ChipField source="name" />
    </Datagrid>
  </List>
)
