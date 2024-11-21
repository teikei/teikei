import { List, Datagrid, TextField, Edit, EditButton } from 'react-admin'

import Pagination from '../components/Pagination'
import BadgesForm from '../components/BadgesForm'

const TITLE = 'Badges'

export const BadgesList = (props) => {
  return (
    <List {...props} title={TITLE} pagination={<Pagination />} perPage={25}>
      <Datagrid rowClick='edit' bulkActionButtons={false}>
        <TextField source='id' />
        <TextField source='name' />
        <TextField source='category' />
        <TextField source='country' />
        <EditButton />
      </Datagrid>
    </List>
  )
}

export const BadgesEdit = (props) => (
  <Edit {...props}>
    <BadgesForm />
  </Edit>
)
