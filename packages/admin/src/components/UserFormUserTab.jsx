import { Box, Typography } from '@mui/material'
import TwoElementRow from './TwoElementRow.jsx'
import {
  BooleanField,
  BooleanInput,
  DateInput,
  ReferenceArrayInput,
  SelectArrayInput,
  SelectInput,
  TextInput,
  usePermissions
} from 'react-admin'
import { hasSuperAdminRole } from '../authorization.js'
import { userStateChoices } from '../lib/enumerations.js'
import UserStateChangeButton from './UserStateChangeButton.jsx'
import * as React from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

export const UserFormUserTab = ({ onAccountDataChange }) => {
  const { permissions } = usePermissions()

  const { control } = useFormContext()
  const roles = useWatch({ control, name: 'roles' })

  return (
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
          <Typography variant='h6' gutterBottom>
            Settings
          </Typography>
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
          {(roles.includes('2') || roles.includes('3')) && (
            <>
              <ReferenceArrayInput
                margin='none'
                source='adminOrigins'
                reference='admin/origins'
                filter={{ origin: { $ne: 'default' } }}
              >
                <SelectArrayInput
                  fullWidth
                  translateChoice={false}
                  variant='standard'
                  optionText='origin'
                  disabled={!hasSuperAdminRole(permissions)}
                />
              </ReferenceArrayInput>
              <BooleanInput
                margin='none'
                fullWidth
                variant='standard'
                source='adminEmailNotifications'
                label='Receive Admin Emails'
              />
            </>
          )}
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
              onStateChanged={() => onAccountDataChange(true)}
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
  )
}
