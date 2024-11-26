import { Datagrid, List, TextField } from 'react-admin'
import Pagination from '../components/Pagination'

const TITLE = 'Goals'

export const GoalsList = (props) => (
  <List {...props} title={TITLE} pagination={<Pagination />} perPage={25}>
    <Datagrid bulkActionButtons={false}>
      <TextField source='id' />
      <TextField source='name' />
    </Datagrid>
  </List>
)
