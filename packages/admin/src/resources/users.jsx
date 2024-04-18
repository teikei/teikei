import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  Edit,
  Filter,
  TextInput,
  FilterList,
  FilterListItem,
  BooleanInput,
  SelectInput,
  DateField,
  DeleteButton,
  EditButton,
  usePermissions,
  SelectField,
} from "react-admin"

import Typography from "@mui/material/Typography"

import { FilterLiveSearch } from "../components/FilterLiveSearch"
import UserForm from "../components/UserForm"
import FilterSidebar from "../components/FilterSidebar"
import Pagination from "../components/Pagination"
import { hasSuperAdminRole } from "../authorization"
import { userStateChoices } from "../lib/enumerations"

const TITLE = "Users"

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
        { id: "https://ernte-teilen.org", name: "https://ernte-teilen.org" },
        {
          id: "https://www.solidarische-landwirtschaft.org",
          name: "https://www.solidarische-landwirtschaft.org",
        },
        { id: "https://www.solawi.ch", name: "https://www.solawi.ch" },
      ]}
    />
    <SelectInput
      fullWidth
      margin="none"
      variant="standard"
      source="state"
      choices={userStateChoices}
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
    <FilterLiveSearch
      fullWidth
      margin="none"
      variant="standard"
      source="email"
      label="email"
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
          origin: "https://ernte-teilen.org",
        }}
      />
      <FilterListItem
        label="DE - Solidarische Landwirtschaft"
        value={{
          origin: "https://www.solidarische-landwirtschaft.org",
        }}
      />
      <FilterListItem
        label="CH - Solawi"
        value={{
          origin: "https://www.solawi.ch",
        }}
      />
    </FilterList>
    <FilterList label="Roles">
      <FilterListItem
        label="User"
        value={{
          "roles.id": "1",
        }}
      />
      <FilterListItem
        label="Admin"
        value={{
          "roles.id": "2",
        }}
      />
      <FilterListItem
        label="Superadmin"
        value={{
          "roles.id": "3",
        }}
      />
    </FilterList>
    <FilterList label="State">
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
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="email" />
        <BooleanField source="isVerified" label="Verified" />
        <SelectField source="state" choices={userStateChoices} />
        <DateField source="lastLogin" />
        <BooleanField source="active" />
        <EditButton />
        {hasSuperAdminRole(permissions) && <DeleteButton />}
      </Datagrid>
    </List>
  )
}

export const UsersEdit = (props) => {
  const { permissions } = usePermissions()

  return (
    <Edit
      {...props}
      title={`${TITLE} - ${props.id}`}
      transform={(data) => {
        if (!hasSuperAdminRole(permissions)) delete data.roles
        return data
      }}
    >
      <UserForm />
    </Edit>
  )
}

export default UsersList
