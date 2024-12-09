import { Datagrid, List, TextField } from 'react-admin'
import Pagination from '../components/Pagination'

const TITLE = 'Badges'

export const BadgesList = (props) => {
  return (
    <List {...props} title={TITLE} pagination={<Pagination />} perPage={25}>
      <Datagrid rowClick='edit' bulkActionButtons={false}>
        <TextField source='id' />
        <TextField source='name' />
        <TextField source='category' />
        <TextField source='country' />
      </Datagrid>
    </List>
  )
}
