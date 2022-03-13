import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  Edit,
  Filter,
  TextInput,
  BooleanInput,
  FilterList,
  FilterListItem,
  SelectInput,
  FilterLiveSearch,
  DateField,
  NumberInput,
  EditButton,
  DeleteButton,
} from 'react-admin'
import Typography from '@material-ui/core/Typography'

import FarmForm from '../components/FarmForm'
import FilterSidebar from '../components/FilterSidebar'
import Pagination from '../components/Pagination'
import { hasSuperAdminRole } from '../authorization'

const TITLE = 'Farms'

const FarmsFilter = (props) => (
  <Filter {...props}>
    <TextInput fullWidth margin="none" variant="standard" source="id" />
    <TextInput fullWidth margin="none" variant="standard" source="name" />
    <TextInput fullWidth margin="none" variant="standard" source="address" />
    <TextInput fullWidth margin="none" variant="standard" source="postalcode" />
    <TextInput fullWidth margin="none" variant="standard" source="city" />
    <TextInput fullWidth margin="none" variant="standard" source="state" />
    <TextInput fullWidth margin="none" variant="standard" source="country" />
    <TextInput fullWidth margin="none" variant="standard" source="url" />
    <TextInput
      fullWidth
      margin="none"
      variant="standard"
      source="description"
    />
    <NumberInput
      fullWidth
      margin="none"
      variant="standard"
      source="foundedAtMonth"
    />
    <NumberInput
      fullWidth
      margin="none"
      variant="standard"
      source="foundedAtYear"
    />
    <NumberInput
      fullWidth
      margin="none"
      variant="standard"
      source="maximumMembers"
    />
    <TextInput
      fullWidth
      margin="none"
      variant="standard"
      source="additionalProductInformation"
    />
    <TextInput
      fullWidth
      margin="none"
      variant="standard"
      source="participation"
    />
    <TextInput
      fullWidth
      margin="none"
      variant="standard"
      source="economicalBehavior"
    />
    <SelectInput
      fullWidth
      margin="none"
      variant="standard"
      source="acceptsNewMembers"
      choices={[
        { id: 'yes', name: 'yes' },
        { id: 'no', name: 'no' },
        { id: 'waitlist', name: 'waitlist' },
      ]}
    />
    <BooleanInput
      fullWidth
      margin="none"
      variant="standard"
      source="actsEcologically"
    />
    <BooleanInput fullWidth margin="none" variant="standard" source="active" />
  </Filter>
)

export const FarmsFilterSidebar = () => (
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
    <FilterLiveSearch
      fullWidth
      margin="none"
      variant="standard"
      source="postalcode"
      label="postalcode"
    />
    <FilterLiveSearch
      fullWidth
      margin="none"
      variant="standard"
      source="city"
      label="city"
    />
    <FilterList label="Country">
      <FilterListItem
        label="Germany"
        value={{
          country: 'DEU',
        }}
      />
      <FilterListItem
        label="Switzerland"
        value={{
          country: 'CHE',
        }}
      />
      <FilterListItem
        label="Austria"
        value={{
          country: 'AUT',
        }}
      />
    </FilterList>
    <FilterList label="Active">
      <FilterListItem
        label="Yes"
        value={{
          active: true,
        }}
      />
      <FilterListItem
        label="No"
        value={{
          active: false,
        }}
      />
    </FilterList>
    <FilterList label="Badges">
      <FilterListItem
        label="Netzwerk solidarische Landwirtschaft e.V."
        value={{
          'badges.id': 1,
        }}
      />
    </FilterList>
  </FilterSidebar>
)

export const FarmsList = (props) => {
  const { permissions } = props
  return (
    <List
      {...props}
      title={TITLE}
      bulkActionButtons={false}
      filters={<FarmsFilter />}
      aside={<FarmsFilterSidebar />}
      pagination={<Pagination />}
      perPage={25}
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <BooleanField source="active" />
        <TextField source="name" />
        <TextField source="city" />
        <TextField source="state" />
        <TextField source="country" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
        <EditButton />
        {hasSuperAdminRole(permissions) && <DeleteButton undoable={false} />}
      </Datagrid>
    </List>
  )
}

export const FarmsEdit = (props) => (
  <Edit {...props} title={`${TITLE} - ${props.id}`}>
    <FarmForm />
  </Edit>
)
