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
  useRecordContext
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
import UserStateChangeButton from './UserStateChangeButton'
import { useState } from 'react'
import { useFormContext, useFormState, useWatch } from 'react-hook-form'
import { UserFormUserTab } from './UserFormUserTab.jsx'

const CustomToolbar = ({ saving, alwaysEnable }) => {
  return (
    <Toolbar>
      <Box display='flex' width='100%' justifyContent='flex-end'>
        <ListButton
          label='Cancel'
          icon={null}
          variant='filled'
          style={{ marginRight: '2rem' }}
        />
        <SaveButton saving={saving} alwaysEnable={alwaysEnable} />
      </Box>
    </Toolbar>
  )
}

const EntryEditButton = () => {
  const record = useRecordContext()
  const createPath = useCreatePath()

  return (
    <Button
      component={Link}
      to={createPath({
        type: 'edit',
        resource: `admin/${record.type.toLowerCase()}s`,
        id: record._id
      })}
      label='EDIT'
      onClick={(e) => e.stopPropagation()}
    >
      <ContentCreate />
    </Button>
  )
}

const UserForm = (props) => {
  const [accountStateChanged, setAccountDataChanged] = useState(false)

  return (
    <TabbedForm
      warnWhenUnsavedChanges
      {...props}
      toolbar={
        <CustomToolbar
          saving={props.saving}
          alwaysEnable={accountStateChanged}
        />
      }
    >
      <TabbedForm.Tab label='User'>
        <UserFormUserTab onAccountDataChange={setAccountDataChanged} />
      </TabbedForm.Tab>
      <TabbedForm.Tab label='Entries'>
        <ReferenceManyField reference='admin/entries' target='userId'>
          <Datagrid
            isRowSelectable={() => false}
            bulkActionButtons={false}
            sx={{ width: '100%' }}
          >
            <TextField
              margin='none'
              variant='standard'
              source='_id'
              sortable={false}
            />
            <TextField
              margin='none'
              variant='standard'
              source='type'
              sortable={false}
            />
            <TextField
              margin='none'
              variant='standard'
              source='name'
              sortable={false}
            />
            <TextField
              margin='none'
              variant='standard'
              source='address'
              sortable={false}
            />
            <TextField
              margin='none'
              variant='standard'
              source='postalcode'
              sortable={false}
            />
            <TextField
              margin='none'
              variant='standard'
              source='city'
              sortable={false}
            />
            <TextField
              margin='none'
              variant='standard'
              source='state'
              sortable={false}
            />
            <TextField
              margin='none'
              variant='standard'
              source='country'
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
