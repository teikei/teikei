import { Box, Toolbar, Typography } from '@mui/material'
import {
  DateInput,
  Form,
  ListButton,
  ReferenceField,
  SaveButton,
  SelectInput,
  TextInput
} from 'react-admin'
import Spacer from './Spacer'

const EmailMessagesForm = (props) => (
  <Form {...props}>
    <Box p='1em'>
      <Box display='flex'>
        {/* main */}
        <Box flex={80} mr='2rem'>
          <TextInput
            label='id'
            fullWidth
            variant='standard'
            source='id'
            margin='none'
            disabled
          />
          <ReferenceField reference='admin/email-campaigns' source='campaignId'>
            <TextInput
              fullWidth
              variant='standard'
              label='Campaign'
              source='name'
              disabled
            />
          </ReferenceField>
          <ReferenceField reference='admin/users' source='userId'>
            <TextInput
              fullWidth
              variant='standard'
              source='email'
              label='User Email'
              disabled
            />
          </ReferenceField>
          <Spacer />
          <SelectInput
            variant='standard'
            fullWidth
            margin='none'
            source='status'
            translateChoice={false}
            disabled
            choices={[
              { id: 'QUEUED', name: 'QUEUED' },
              { id: 'SENT', name: 'SENT' },
              { id: 'UNSUBSCRIBED', name: 'UNSUBSCRIBED' }
            ]}
          />
        </Box>
        {/* admin */}
        <Box flex={20} ml='2rem'>
          <Typography variant='h6' gutterBottom>
            Admin
          </Typography>
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
    <Toolbar>
      <Box display='flex' width='100%' justifyContent='flex-end'>
        <ListButton
          label='Cancel'
          icon={null}
          variant='filled'
          style={{ marginRight: '2rem' }}
        />
        <SaveButton saving={props.saving} />
      </Box>
    </Toolbar>
  </Form>
)

export default EmailMessagesForm
