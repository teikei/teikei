import { List, Datagrid, TextField, ChipField } from 'react-admin'
import Pagination from '../components/Pagination'

const TITLE = 'Roles'

export const RolesList = (props) => (
  <List
    {...props}
    title={TITLE}
    bulkActionButtons={false}
    pagination={<Pagination />}
    perPage={25}
  >
    <Datagrid>
      <TextField source="id" />
      <ChipField source="name" />
    </Datagrid>
  </List>
)
