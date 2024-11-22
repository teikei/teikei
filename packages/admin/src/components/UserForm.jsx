/* eslint-disable react/jsx-handler-names */
import ContentCreate from '@mui/icons-material/Create'
import { Box, Toolbar, Typography } from '@mui/material'
import { useCreatePath } from 'ra-core'
import { useState } from 'react'
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
import { Link } from 'react-router-dom'
import { hasSuperAdminRole } from '../authorization'
import { userStateChoices } from '../lib/enumerations'
import Spacer from './Spacer'
import TwoElementRow from './TwoElementRow'
import UserStateChangeButton from './UserStateChangeButton'

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
  const { permissions } = usePermissions()
  const user = useRecordContext()
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
        <Box sx={{ p: '1em', width: '100%' }}>
          <Box display='flex'>
            {/* main */}
            <Box flex={80} mr='2rem'>
              <Typography variant='h6' gutterBottom>
                User Data
              </Typography>
              <TwoElementRow
                left={
                  <TextInput
                    label='id'
                    fullWidth
                    variant='standard'
                    source='id'
                    margin='none'
                    disabled
                  />
                }
                right={
                  <TextInput
                    margin='none'
                    variant='standard'
                    fullWidth
                    source='name'
                  />
                }
              />
              <TextInput
                fullWidth
                variant='standard'
                multiline
                margin='none'
                source='email'
              />
              <TextInput
                margin='none'
                fullWidth
                variant='standard'
                source='phone'
              />
              <Spacer />
              <ReferenceArrayInput
                margin='none'
                source='roles'
                reference='admin/roles'
              >
                <SelectArrayInput
                  fullWidth
                  translateChoice={false}
                  variant='standard'
                  optionText='name'
                  disabled={!hasSuperAdminRole(permissions)}
                />
              </ReferenceArrayInput>
              <Typography variant='h6' gutterBottom>
                Account Status
              </Typography>
              <TwoElementRow
                left={
                  <SelectInput
                    variant='standard'
                    source='state'
                    fullWidth
                    disabled
                    choices={userStateChoices}
                  />
                }
                right={
                  <DateInput
                    variant='standard'
                    fullWidth
                    disabled
                    sx={{ mt: 1 }}
                    margin='none'
                    label='Last Login'
                    source='lastLogin'
                  />
                }
              />

              <TwoElementRow
                left={
                  <TextInput
                    fullWidth
                    disabled
                    margin='none'
                    variant='standard'
                    source='bounceType'
                  />
                }
                right={
                  <TextInput
                    fullWidth
                    disabled
                    margin='none'
                    variant='standard'
                    source='bounceName'
                  />
                }
                ratio={50}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <UserStateChangeButton
                  onStateChanged={() => setAccountDataChanged(true)}
                />
              </Box>
            </Box>
            {/* admin */}
            <Box flex={20} ml='2rem'>
              <Typography variant='h6' gutterBottom>
                Admin
              </Typography>
              <BooleanInput margin='none' variant='standard' source='active' />
              <Box
                display='flex'
                style={{ color: 'rgba(0, 0, 0, 0.38)', marginBottom: '1rem' }}
              >
                Verified:&nbsp;&nbsp;
                <BooleanField
                  margin='none'
                  variant='standard'
                  source='isVerified'
                  disabled
                />
              </Box>
              {/* TODO better way to do this avoiding ids? */}
              {(user.roles.includes('2') || user.roles.includes('3')) && (
                <BooleanInput
                  margin='none'
                  fullWidth
                  variant='standard'
                  source='adminEmailNotifications'
                  label='Receive Admin Emails'
                />
              )}
              <TextInput
                variant='standard'
                fullWidth
                disabled
                margin='none'
                source='origin'
              />
              <TextInput
                variant='standard'
                fullWidth
                disabled
                margin='none'
                source='baseurl'
              />
              <DateInput
                variant='standard'
                fullWidth
                disabled
                margin='none'
                label='Created'
                source='createdAt'
              />
              <DateInput
                variant='standard'
                fullWidth
                disabled
                margin='none'
                label='Updated'
                source='updatedAt'
              />
            </Box>
          </Box>
        </Box>
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
