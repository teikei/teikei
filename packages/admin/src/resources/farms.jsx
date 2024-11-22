import { Chip } from '@mui/material'
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
  NumberInput,
  SelectInput,
  TextField,
  TextInput,
  usePermissions,
  useTranslate
} from 'react-admin'
import { hasSuperAdminRole } from '../authorization'
import FarmForm from '../components/FarmForm'
import { FilterLiveSearch } from '../components/FilterLiveSearch'
import FilterSidebar from '../components/FilterSidebar'
import Pagination from '../components/Pagination'

const TITLE = 'Farms'

const QuickFilter = ({ label }) => {
  const translate = useTranslate()
  return <Chip label={translate(label)} />
}

const FarmsFilter = (props) => (
  <Filter {...props}>
    <TextInput margin='none' variant='standard' source='id' />
    <TextInput margin='none' variant='standard' source='name' />
    <TextInput margin='none' variant='standard' source='address' />
    <TextInput margin='none' variant='standard' source='postalcode' />
    <TextInput margin='none' variant='standard' source='city' />
    <TextInput margin='none' variant='standard' source='state' />
    <TextInput margin='none' variant='standard' source='country' />
    <TextInput margin='none' variant='standard' source='url' />
    <TextInput margin='none' variant='standard' source='description' />
    <NumberInput margin='none' variant='standard' source='foundedAtMonth' />
    <NumberInput margin='none' variant='standard' source='foundedAtYear' />
    <NumberInput margin='none' variant='standard' source='maximumMembers' />
    <TextInput
      margin='none'
      variant='standard'
      source='additionalProductInformation'
    />
    <TextInput margin='none' variant='standard' source='participation' />
    <TextInput margin='none' variant='standard' source='economicalBehavior' />
    <SelectInput
      margin='none'
      variant='standard'
      source='acceptsNewMembers'
      choices={[
        { id: 'yes', name: 'yes' },
        { id: 'no', name: 'no' },
        { id: 'waitlist', name: 'waitlist' }
      ]}
    />
    <BooleanInput margin='none' variant='standard' source='actsEcological' />
    <BooleanInput margin='none' variant='standard' source='active' />
    <QuickFilter source='hasBadge' label='Network Member' />
    <QuickFilter source='notHasBadge' label='Network Non-Member' />
  </Filter>
)

const isBadgeItemSelected = (attribute) => (value, filters) =>
  filters[attribute] && value[attribute]

const oppositeAttribute = {
  hasBadge: 'notHasBadge',
  notHasBadge: 'hasBadge'
}

const toggleBadgeFilter = (attribute) => (value, filters) => {
  if (!value[attribute]) {
    return filters
  }
  if (filters[attribute]) {
    delete filters[attribute]
    return filters
  }
  if (!filters[attribute]) {
    delete filters[oppositeAttribute[attribute]]
    return { ...filters, ...value }
  }
  return filters
}

export const FarmsFilterSidebar = () => (
  <FilterSidebar>
    <Typography>Quick Filters</Typography>
    <FilterLiveSearch margin='none' variant='standard' source='id' label='id' />
    <FilterLiveSearch
      margin='none'
      variant='standard'
      source='name'
      label='name'
    />
    <FilterLiveSearch
      margin='none'
      variant='standard'
      source='postalcode'
      label='postalcode'
    />
    <FilterLiveSearch
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
    <FilterList label='Netzwerk solidarische Landwirtschaft e.V.'>
      <FilterListItem
        label='Member'
        value={{
          hasBadge: 1
        }}
        isSelected={isBadgeItemSelected('hasBadge')}
        toggleFilter={toggleBadgeFilter('hasBadge')}
      />
      <FilterListItem
        label='Non-Member'
        value={{
          notHasBadge: 1
        }}
        isSelected={isBadgeItemSelected('notHasBadge')}
        toggleFilter={toggleBadgeFilter('notHasBadge')}
      />
    </FilterList>
  </FilterSidebar>
)

export const FarmsList = (props) => {
  const { permissions } = usePermissions()
  return (
    <List
      {...props}
      title={TITLE}
      filters={<FarmsFilter />}
      aside={<FarmsFilterSidebar />}
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

export const FarmsEdit = (props) => (
  <Edit {...props} title={`${TITLE} - ${props.id}`}>
    <FarmForm />
  </Edit>
)
