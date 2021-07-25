import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  Edit,
  Filter,
  TextInput,
  FilterLiveSearch,
  FilterList,
  FilterListItem,
  BooleanInput,
  SelectInput,
  DateField,
} from 'react-admin'
import Typography from '@material-ui/core/Typography'

import UserForm from '../components/UserForm'
import FilterSidebar from '../components/FilterSidebar'
import Pagination from '../components/Pagination'

const TITLE = 'Users'

const UserFilter = (props) => (
  <Filter {...props}>
    <TextInput fullWidth margin="none" variant="standard" source="id" />
    <TextInput fullWidth margin="none" variant="standard" source="name" />
    <TextInput fullWidth margin="none" variant="standard" source="email" />
    <TextInput fullWidth margin="none" variant="standard" source="phone" />
    <BooleanInput
      fullWidth
      margin="none"
      variant="standard"
      source="isVerified"
    />
    <BooleanInput
      fullWidth
      margin="none"
      variant="standard"
      source="adminEmailNotifications"
    />
    <SelectInput
      fullWidth
      margin="none"
      variant="standard"
      source="origin"
      choices={[
        { id: 'https://ernte-teilen.org', name: 'https://ernte-teilen.org' },
        {
          id: 'https://www.solidarische-landwirtschaft.org',
          name: 'https://www.solidarische-landwirtschaft.org',
        },
        { id: 'https://www.solawi.ch', name: 'https://www.solawi.ch' },
      ]}
    />
  </Filter>
)

export const UserFilterSidebar = () => (
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
      source="name"
      label="name"
    />
    <FilterList label="Is Verified">
      <FilterListItem
        label="Yes"
        value={{
          isVerified: true,
        }}
      />
      <FilterListItem
        label="No"
        value={{
          isVerified: false,
        }}
      />
    </FilterList>
    <FilterList label="Origin">
      <FilterListItem
        label="DE - Ernte Teilen"
        value={{
          origin: 'https://ernte-teilen.org',
        }}
      />
      <FilterListItem
        label="DE - Solidarische Landwirtschaft"
        value={{
          origin: 'https://www.solidarische-landwirtschaft.org',
        }}
      />
      <FilterListItem
        label="CH - Solawi"
        value={{
          origin: 'https://www.solawi.ch',
        }}
      />
    </FilterList>
  </FilterSidebar>
)

export const UsersList = (props) => (
  <List
    {...props}
    title={TITLE}
    bulkActionButtons={false}
    filters={<UserFilter />}
    aside={<UserFilterSidebar />}
    pagination={<Pagination />}
    exporter={false}
    perPage={25}
  >
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="email" />
      <BooleanField source="isVerified" />
      <TextField source="origin" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </Datagrid>
  </List>
)

export const UsersEdit = (props) => (
  <Edit {...props} title={`${TITLE} - ${props.id}`}>
    <UserForm />
  </Edit>
)

export default UsersList
