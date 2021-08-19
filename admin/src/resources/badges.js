import {
  List,
  Datagrid,
  TextField,
  ChipField,
  Edit,
  EditButton,
} from 'react-admin'

import Pagination from '../components/Pagination'
import BadgesForm from '../components/BadgesForm'

const TITLE = 'Badges'

export const BadgesList = (props) => {
  return (
    <List
      {...props}
      title={TITLE}
      bulkActionButtons={false}
      pagination={<Pagination />}
      perPage={25}
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="name" />
        <ChipField source="category" />
        <TextField source="country" />
        <EditButton />
      </Datagrid>
    </List>
  )
}

export const BadgesEdit = (props) => (
  <Edit {...props} title={`${TITLE} - ${props.id}`}>
    <BadgesForm />
  </Edit>
)
