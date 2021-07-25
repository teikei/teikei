import { List, Datagrid, TextField, ChipField } from 'react-admin'
import Pagination from '../components/Pagination'

const TITLE = 'Goals'

export const GoalsList = (props) => (
  <List
    {...props}
    title={TITLE}
    bulkActionButtons={false}
    pagination={<Pagination />}
  >
    <Datagrid>
      <TextField source="id" />
      <ChipField source="name" />
    </Datagrid>
  </List>
)
