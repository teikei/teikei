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
  TextField,
  TextInput,
  usePermissions
} from 'react-admin'
import { hasSuperAdminRole } from '../authorization'
import { FilterLiveSearch } from '../components/FilterLiveSearch'
import FilterSidebar from '../components/FilterSidebar'
import InitiativeForm from '../components/InitiativeForm'
import Pagination from '../components/Pagination'

const TITLE = 'Initiatives'

const InitiativesFilter = (props) => (
  <Filter {...props}>
    <TextInput fullWidth margin='none' variant='standard' source='id' />
    <TextInput fullWidth margin='none' variant='standard' source='name' />
    <TextInput fullWidth margin='none' variant='standard' source='address' />
    <TextInput fullWidth margin='none' variant='standard' source='postalcode' />
    <TextInput fullWidth margin='none' variant='standard' source='city' />
    <TextInput fullWidth margin='none' variant='standard' source='state' />
    <TextInput fullWidth margin='none' variant='standard' source='country' />
    <TextInput fullWidth margin='none' variant='standard' source='url' />
    <TextInput
      fullWidth
      margin='none'
      variant='standard'
      source='description'
    />
    <BooleanInput fullWidth margin='none' variant='standard' source='active' />
  </Filter>
)

export const InitiativesFilterSidebar = () => (
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
      source='postalcode'
      label='postalcode'
    />
    <FilterLiveSearch
      fullWidth
      margin='none'
      variant='standard'
      source='city'
      label='city'
    />
    <FilterList label='Country'>
      <FilterListItem
        label='Germany'
        value={{
          country: 'DEU'
        }}
      />
      <FilterListItem
        label='Switzerland'
        value={{
          country: 'CHE'
        }}
      />
      <FilterListItem
        label='Austria'
        value={{
          country: 'AUT'
        }}
      />
    </FilterList>
    <FilterList label='Active'>
      <FilterListItem
        label='Yes'
        value={{
          active: true
        }}
      />
      <FilterListItem
        label='No'
        value={{
          active: false
        }}
      />
    </FilterList>
    <FilterList label='Badges'>
      <FilterListItem
        label='Netzwerk solidarische Landwirtschaft e.V.'
        value={{
          'badges.id': 1
        }}
      />
    </FilterList>
  </FilterSidebar>
)

export const InitiativesList = (props) => {
  const { permissions } = usePermissions()
  return (
    <List
      {...props}
      title={TITLE}
      filters={<InitiativesFilter />}
      aside={<InitiativesFilterSidebar />}
      pagination={<Pagination />}
      perPage={25}
    >
      <Datagrid rowClick='edit' bulkActionButtons={false}>
        <TextField source='id' />
        <TextField source='name' />
        <TextField source='city' />
        <TextField source='state' />
        <TextField source='country' />
        <DateField source='createdAt' />
        <DateField source='updatedAt' />
        <BooleanField source='active' />
        <EditButton />
        {hasSuperAdminRole(permissions) && <DeleteButton />}
      </Datagrid>
    </List>
  )
}
export const InitiativesEdit = (props) => (
  <Edit {...props} title={`${TITLE} - ${props.id}`}>
    <InitiativeForm />
  </Edit>
)
