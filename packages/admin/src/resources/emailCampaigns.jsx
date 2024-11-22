import {
  Create,
  Datagrid,
  DeleteButton,
  Edit,
  EditButton,
  List,
  TextField
} from 'react-admin'
import { useStatus } from '../App'
import { hasSuperAdminRole } from '../authorization'
import EmailCampaignForm from '../components/EmailCampaignForm'
import Pagination from '../components/Pagination'

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
  <Edit {...props} title={`${TITLE} - ${props.id}`}>
    <EmailCampaignForm />
  </Edit>
)

export const EmailCampaignsCreate = (props) => (
  <Create
    {...props}
    title={`${TITLE} - new`}
    redirect='list'
    transform={(data) => {
      delete data.testEmailUser
      return data
    }}
  >
    <EmailCampaignForm />
  </Create>
)
