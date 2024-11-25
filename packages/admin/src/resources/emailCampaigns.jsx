import {
  List,
  Datagrid,
  TextField,
  Edit,
  Create,
  EditButton,
  DeleteButton
} from 'react-admin'
import Pagination from '../components/Pagination'
import EmailCampaignForm from '../components/EmailCampaignForm'
import { hasSuperAdminRole } from '../authorization'
import { useStatus } from '../App'

const TITLE = 'Email Campaigns'

export const EmailCampaignsList = (props) => {
  const {
    features: { emailCampaigns }
  } = useStatus()
  const { permissions } = props
  return (
    <List
      {...props}
      title={TITLE}
      pagination={<Pagination />}
      perPage={25}
      hasCreate={emailCampaigns === 'true'}
    >
      <Datagrid bulkActionButtons={false}>
        <TextField source='id' />
        <TextField source='name' />
        <TextField source='template' />
        <TextField source='status' />
        {emailCampaigns === 'true' && <EditButton />}
        {hasSuperAdminRole(permissions) && <DeleteButton />}
      </Datagrid>
    </List>
  )
}

export const EmailCampaignsEdit = (props) => (
  <Edit {...props}>
    <EmailCampaignForm />
  </Edit>
)

export const EmailCampaignsCreate = (props) => (
  <Create
    {...props}
    redirect='list'
    transform={(data) => {
      delete data.testEmailUser
      return data
    }}
  >
    <EmailCampaignForm />
  </Create>
)
