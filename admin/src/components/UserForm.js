/* eslint-disable react/jsx-handler-names */
import {
  BooleanField,
  BooleanInput,
  Button,
  Datagrid,
  DateInput,
  ListButton,
  ReferenceArrayInput,
  ReferenceManyField,
  SaveButton,
  SelectArrayInput,
  SelectInput,
  TabbedForm,
  TextField,
  TextInput,
  usePermissions,
  useRecordContext,
} from 'react-admin'

import { Box, Toolbar, Typography } from '@mui/material'

import TwoElementRow from './TwoElementRow'
import Spacer from './Spacer'
import { hasSuperAdminRole } from '../authorization'
import { userStateChoices } from '../lib/enumerations'
import { Link } from 'react-router-dom'
import * as React from 'react'
import ContentCreate from '@mui/icons-material/Create'
import { useCreatePath } from 'ra-core'

const CustomToolbar = ({ saving }) => (
  <Toolbar>
    <Box display="flex" width="100%" justifyContent="flex-end">
      <ListButton
        label="Cancel"
        icon={null}
        variant="filled"
        style={{ marginRight: '2rem' }}
      />
      <SaveButton saving={saving} />
    </Box>
  </Toolbar>
)

const EntryEditButton = () => {
  const record = useRecordContext()
  console.log('record', record)
  const createPath = useCreatePath()

  return (
    <Button
      component={Link}
      to={createPath({
        type: 'edit',
        resource: `admin/${record.type.toLowerCase()}s`,
        id: record.id,
      })}
      // state={scrollStates[String(scrollToTop)]}
      label="EDIT"
      onClick={(e) => e.stopPropagation()}
      // {...(rest as any)}
    >
      <ContentCreate />
    </Button>
  )
  // return <EditButton href={`/foo/bar`} />
}

const UserForm = (props) => {
  const { permissions } = usePermissions()
  return (
    <TabbedForm
      warnWhenUnsavedChanges
      {...props}
      toolbar={<CustomToolbar saving={props.saving} />}
    >
      <TabbedForm.Tab label="User">
        <Box sx={{ p: '1em', width: '100%' }}>
          <Box display="flex">
            {/*main*/}
            <Box flex={80} mr="2rem">
              <TwoElementRow
                left={
                  <TextInput
                    label="id"
                    fullWidth
                    variant="standard"
                    source="id"
                    margin="none"
                    disabled
                  />
                }
                right={
                  <TextInput
                    margin="none"
                    variant="standard"
                    fullWidth
                    source="name"
                  />
                }
                ratio={20}
              />
              <TextInput
                fullWidth
                variant="standard"
                multiline
                margin="none"
                source="email"
              />
              <TextInput
                margin="none"
                fullWidth
                variant="standard"
                source="phone"
              />
              <Spacer />
              <SelectInput
                variant="standard"
                source="state"
                fullWidth
                disabled
                choices={userStateChoices}
              />
              <ReferenceArrayInput
                margin="none"
                source="roles"
                reference="admin/roles"
              >
                <SelectArrayInput
                  fullWidth
                  translateChoice={false}
                  variant="standard"
                  optionText="name"
                  disabled={!hasSuperAdminRole(permissions)}
                />
              </ReferenceArrayInput>
              <BooleanInput
                margin="none"
                fullWidth
                variant="standard"
                source="adminEmailNotifications"
              />
            </Box>
            {/*admin*/}
            <Box flex={20} ml="2rem">
              <Typography variant="h6" gutterBottom>
                Admin
              </Typography>
              <Box
                display="flex"
                style={{ color: 'rgba(0, 0, 0, 0.38)', marginBottom: '1rem' }}
              >
                Verified:&nbsp;&nbsp;
                <BooleanField
                  fullWidth
                  margin="none"
                  variant="standard"
                  record={props.record}
                  source="isVerified"
                  disabled
                />
              </Box>
              <TextInput
                variant="standard"
                fullWidth
                disabled
                margin="none"
                source="origin"
              />
              <TextInput
                variant="standard"
                fullWidth
                disabled
                margin="none"
                source="baseurl"
              />
              <DateInput
                variant="standard"
                fullWidth
                disabled
                margin="none"
                label="Created"
                source="createdAt"
              />
              <DateInput
                variant="standard"
                fullWidth
                disabled
                margin="none"
                label="Updated"
                source="updatedAt"
              />
              <DateInput
                variant="standard"
                fullWidth
                disabled
                margin="none"
                label="Last Login"
                source="lastLogin"
              />
            </Box>
          </Box>
        </Box>
      </TabbedForm.Tab>
      <TabbedForm.Tab label="Entries">
        <ReferenceManyField reference="admin/entries" target="userId">
          <Datagrid
            isRowSelectable={() => false}
            bulkActionButtons={false}
            sx={{ width: '100%' }}
          >
            <TextField
              fullWidth
              margin="none"
              variant="standard"
              source="id"
              sortable={false}
            />
            <TextField
              fullWidth
              margin="none"
              variant="standard"
              source="type"
              sortable={false}
            />
            <TextField
              fullWidth
              margin="none"
              variant="standard"
              source="name"
              sortable={false}
            />
            <TextField
              fullWidth
              margin="none"
              variant="standard"
              source="address"
              sortable={false}
            />
            <TextField
              fullWidth
              margin="none"
              variant="standard"
              source="postalcode"
              sortable={false}
            />
            <TextField
              fullWidth
              margin="none"
              variant="standard"
              source="city"
              sortable={false}
            />
            <TextField
              fullWidth
              margin="none"
              variant="standard"
              source="state"
              sortable={false}
            />
            <TextField
              fullWidth
              margin="none"
              variant="standard"
              source="country"
              sortable={false}
            />
            <EntryEditButton />
          </Datagrid>
        </ReferenceManyField>
      </TabbedForm.Tab>
    </TabbedForm>
  )
}

export default UserForm
