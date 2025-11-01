import Typography from '@mui/material/Typography'
import {
  BooleanField,
  BooleanInput,
  Datagrid,
  DateField,
  DeleteButton,
  Edit,
  EditButton,
  Filter,
  FilterList,
  FilterListItem,
  List,
  SelectField,
  SelectInput,
  TextField,
  TextInput,
  useGetList,
  usePermissions
} from 'react-admin'

import { hasAdminRole, hasSuperAdminRole } from '../authorization'
import { FilterLiveSearch } from '../components/FilterLiveSearch'
import FilterSidebar from '../components/FilterSidebar'
import Pagination from '../components/Pagination'
import UserForm from '../components/UserForm'
import { userStateChoices } from '../lib/enumerations'

const TITLE = 'Users'

const UserFilter = (props) => {
  const { data } = useGetList('admin/origins')
  return (
    data && (
      <Filter {...props}>
        <TextInput fullWidth margin='none' variant='standard' source='id' />
        <TextInput fullWidth margin='none' variant='standard' source='name' />
        <TextInput fullWidth margin='none' variant='standard' source='email' />
        <TextInput fullWidth margin='none' variant='standard' source='phone' />
        <BooleanInput
          fullWidth
          margin='none'
          variant='standard'
          source='isVerified'
        />
        <BooleanInput
          fullWidth
          margin='none'
          variant='standard'
          source='adminEmailNotifications'
        />
        <SelectInput
          fullWidth
          margin='none'
          variant='standard'
          source='origin'
          choices={data
            .filter((o) => o.origin !== 'default')
            .map((origin) => ({
              id: origin.origin,
              name: origin.origin
            }))}
        />
        <SelectInput
          fullWidth
          margin='none'
          variant='standard'
          source='state'
          choices={userStateChoices}
        />
      </Filter>
    )
  )
}

export const UserFilterSidebar = () => {
  const { data } = useGetList('admin/origins')
  return (
    <FilterSidebar>
      <Typography>Quick Filters</Typography>
      <FilterLiveSearch
        fullWidth
        margin='none'
        variant='standard'
        source='id'
        label='id'
      />
      <FilterLiveSearch
        fullWidth
        margin='none'
        variant='standard'
        source='name'
        label='name'
      />
      <FilterLiveSearch
        fullWidth
        margin='none'
        variant='standard'
        source='email'
        label='email'
      />
      <FilterList label='Is Verified'>
        <FilterListItem
          label='Yes'
          value={{
            isVerified: true
          }}
        />
        <FilterListItem
          label='No'
          value={{
            isVerified: false
          }}
        />
      </FilterList>
      {data && (
        <FilterList label='Origin'>
          {data
            .filter((o) => o.origin !== 'default')
            .map((origin) => (
              <FilterListItem
                key={origin.id}
                label={origin.origin}
                value={{ origin: origin.origin }}
              />
            ))}
        </FilterList>
      )}
      <FilterList label='Roles'>
        <FilterListItem
          label='User'
          value={{
            'roles.id': '1'
          }}
        />
        <FilterListItem
          label='Admin'
          value={{
            'roles.id': '2'
          }}
        />
        <FilterListItem
          label='Superadmin'
          value={{
            'roles.id': '3'
          }}
        />
      </FilterList>
      <FilterList label='State'>
        {userStateChoices.map((choice) => (
          <FilterListItem
            key={choice.id}
            label={choice.name}
            value={{ state: choice.id }}
          />
        ))}
      </FilterList>
    </FilterSidebar>
  )
}

export const UsersList = (props) => {
  const { permissions } = usePermissions()
  return (
    <List
      {...props}
      title={TITLE}
      filters={<UserFilter />}
      aside={<UserFilterSidebar />}
      pagination={<Pagination />}
      exporter={false}
      perPage={25}
    >
      <Datagrid rowClick='edit' bulkActionButtons={false}>
        <TextField source='id' />
        <TextField source='name' />
        <TextField source='email' />
        <BooleanField source='isVerified' label='Verified' />
        <SelectField source='state' choices={userStateChoices} />
        <DateField source='lastLogin' />
        <BooleanField source='active' />
        <EditButton />
        {hasAdminRole(permissions) && <DeleteButton />}
      </Datagrid>
    </List>
  )
}

export const UsersEdit = (props) => {
  const { permissions } = usePermissions()

  return (
    <Edit
      {...props}
      transform={(data) => {
        if (!hasSuperAdminRole(permissions)) {
          delete data.roles
          delete data.origins
        }
        return data
      }}
    >
      <UserForm />
    </Edit>
  )
}

export default UsersList
