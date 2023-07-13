/* eslint-disable react/jsx-handler-names */
import {
  BooleanField,
  BooleanInput,
  DateInput,
  Form,
  ListButton,
  ReferenceArrayInput,
  SaveButton,
  SelectArrayInput,
  SelectInput,
  TextInput,
  usePermissions,
} from 'react-admin'

import { Box, Toolbar, Typography } from '@mui/material'

import TwoElementRow from './TwoElementRow'
import Spacer from './Spacer'
import { hasSuperAdminRole } from '../authorization'
import { userStateChoices } from '../lib/enumerations'

const UserForm = (props) => {
  const { permissions } = usePermissions()
  return (
    <Form {...props}>
      <Box p="1em">
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
      <Toolbar>
        <Box display="flex" width="100%" justifyContent="flex-end">
          <ListButton
            label="Cancel"
            icon={null}
            variant="filled"
            style={{ marginRight: '2rem' }}
          />
          <SaveButton saving={props.saving} />
        </Box>
      </Toolbar>
    </Form>
  )
}

export default UserForm
