import {
  List,
  Datagrid,
  TextField,
  Edit,
  Create,
  EditButton,
  DeleteButton,
} from 'react-admin'
import Pagination from '../components/Pagination'
import { hasSuperAdminRole } from '../authorization'
import EmailMessagesForm from '../components/EmailMessagesForm'

const TITLE = 'Email Messages'

export const EmailMessagesList = (props) => {
  const { permissions } = props
  return (
    <List {...props} title={TITLE} pagination={<Pagination />} perPage={25}>
      <Datagrid bulkActionButtons={false}>
        <TextField source="id" />
        <TextField source="userId" />
        <TextField source="campaignId" />
        <TextField source="status" />
        <EditButton />
        {hasSuperAdminRole(permissions) && <DeleteButton />}
      </Datagrid>
    </List>
  )
}

export const EmailMessagesEdit = (props) => (
  <Edit {...props} title={`${TITLE} - ${props.id}`}>
    <EmailMessagesForm />
  </Edit>
)

export const EmailMessagesCreate = (props) => (
  <Create {...props} title={`${TITLE} - ${props.id}`} redirect="list">
    <EmailMessagesForm />
  </Create>
)
