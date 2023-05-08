import {
  List,
  Datagrid,
  TextField,
  Edit,
  EditButton,
  DeleteButton,
  ReferenceField,
  Filter,
  TextInput,
  FilterList,
  FilterListItem,
  SelectInput,
} from 'react-admin'
import Pagination from '../components/Pagination'
import { hasSuperAdminRole } from '../authorization'
import EmailMessagesForm from '../components/EmailMessagesForm'
import FilterSidebar from '../components/FilterSidebar'
import Typography from '@mui/material/Typography'
import { FilterLiveSearch } from '../components/FilterLiveSearch'

const TITLE = 'Email Messages'

const EmailMessagesFilter = (props) => (
  <Filter {...props}>
    <TextInput fullWidth margin="none" variant="standard" source="id" />
    <TextInput fullWidth margin="none" variant="standard" source="campaignId" />
    <SelectInput
      fullWidth
      margin="none"
      variant="standard"
      source="status"
      choices={[
        { id: 'QUEUED', name: 'QUEUED' },
        { id: 'SENT', name: 'QUEUED' },
      ]}
    />
  </Filter>
)

export const EmailMessagesFilterSidebar = () => (
  <FilterSidebar>
    <Typography>Quick Filters</Typography>
    <FilterLiveSearch
      fullWidth
      margin="none"
      variant="standard"
      source="id"
      label="id"
    />
    <FilterLiveSearch
      fullWidth
      margin="none"
      variant="standard"
      source="campaignId"
      label="campaignId"
    />
    <FilterList label="Status">
      <FilterListItem
        label="QUEUED"
        value={{
          status: 'QUEUED',
        }}
      />
      <FilterListItem
        label="SENT"
        value={{
          status: 'SENT',
        }}
      />
    </FilterList>
  </FilterSidebar>
)

export const EmailMessagesList = (props) => {
  const { permissions } = props
  return (
    <List
      {...props}
      filters={<EmailMessagesFilter />}
      aside={<EmailMessagesFilterSidebar />}
      title={TITLE}
      // need to limit max rows per page because the API currently cannot fetch more user references in one request
      pagination={<Pagination rowsPerPageOptions={[5, 10]} />}
      perPage={25}
    >
      <Datagrid bulkActionButtons={false}>
        <TextField source="id" />

        <TextField source="campaignId" label="Campaign Id" />
        <ReferenceField
          reference="admin/email-campaigns"
          source="campaignId"
          label="Campaign"
        >
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField
          reference="admin/users"
          source="userId"
          label="User Email"
        >
          <TextField source="email" />
        </ReferenceField>
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
