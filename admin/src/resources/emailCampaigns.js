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
import EmailCampaignForm from '../components/EmailCampaignForm'
import { hasSuperAdminRole } from '../authorization'

const TITLE = 'Email Campaigns'

export const EmailCampaignsList = (props) => {
  const { permissions } = props
  return (
    <List {...props} title={TITLE} pagination={<Pagination />} perPage={25}>
      <Datagrid bulkActionButtons={false}>
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="template" />
        <TextField source="status" />
        <EditButton />
        {hasSuperAdminRole(permissions) && <DeleteButton undoable={false} />}
      </Datagrid>
    </List>
  )
}

export const EmailCampaignsEdit = (props) => (
  <Edit {...props} title={`${TITLE} - ${props.id}`}>
    <EmailCampaignForm />
  </Edit>
)

export const EmailCampaignsCreate = (props) => (
  <Create
    {...props}
    title={`${TITLE} - new`}
    redirect="list"
    transform={(data) => {
      delete data.testEmailUser
      return data
    }}
  >
    <EmailCampaignForm />
  </Create>
)
