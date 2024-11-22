import {
  ChipField,
  Datagrid,
  Edit,
  EditButton,
  List,
  TextField
} from 'react-admin'
import BadgesForm from '../components/BadgesForm'
import Pagination from '../components/Pagination'

const TITLE = 'Badges'

export const BadgesList = (props) => {
  return (
    <List {...props} title={TITLE} pagination={<Pagination />} perPage={25}>
      <Datagrid rowClick='edit' bulkActionButtons={false}>
        <TextField source='id' />
        <TextField source='name' />
        <ChipField source='category' />
        <TextField source='country' />
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
