/* eslint-disable react/jsx-handler-names */
import {
  AutocompleteInput,
  Datagrid,
  DateField,
  DateInput,
  Form,
  ListButton,
  ReferenceField,
  ReferenceInput,
  ReferenceManyField,
  required,
  SaveButton,
  SelectInput,
  TextField,
  TextInput,
} from 'react-admin'
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Toolbar,
  Typography,
} from '@mui/material'
import TwoElementRow from './TwoElementRow'
import Spacer from './Spacer'
import SendCampaignButton from './SendCampaignButton'
import SendTestEmailButton from './SendTestEmailButton'
import { useFormContext } from 'react-hook-form'

const PreviewEmailCard = () => {
  const { watch } = useFormContext()
  const id = watch('id')

  return (
    <Card sx={{ backgroundColor: '#fffcf9', borderRadius: 0 }}>
      <CardContent sx={{ padding: '8px' }}>
        <h3 style={{ margin: '0' }}>Preview</h3>
        {!id && (
          <Box sx={{ marginTop: '8px' }}>
            Campaign must be saved before preview can be sent.
          </Box>
        )}
        {id && (
          <ReferenceInput reference="admin/users" source="userId">
            <AutocompleteInput
              translateChoice={false}
              optionText="email"
              variant="standard"
              label="Test Email Recipient"
              name="testEmailUser"
            />
          </ReferenceInput>
        )}
      </CardContent>
      <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SendTestEmailButton />
      </CardActions>
    </Card>
  )
}

const CampaignMessagesCard = () => {
  const { watch } = useFormContext()
  const id = watch('id')

  return (
    <Card
      sx={{
        backgroundColor: '#fffcf9',
        borderRadius: 0,
        marginTop: '16px',
      }}
    >
      <CardContent sx={{ padding: '8px' }}>
        <h3 style={{ margin: '0' }}>Send</h3>
        <h4>Messages</h4>
        {!id && <div>Campaign must be saved before it can be sent.</div>}
        {id && (
          <ReferenceManyField
            reference="admin/email-messages"
            target="campaignId"
          >
            <Datagrid bulkActionButtons={false} empty={<div>No messages.</div>}>
              <TextField source="id" />
              <TextField source="userId" label="User Id" />
              <ReferenceField
                reference="admin/users"
                source="userId"
                label="User Name"
              >
                <TextField source="name" />
              </ReferenceField>
              <TextField source="status" />
              <DateField source="sentAt" />
              <TextField source="sentTo" />
            </Datagrid>
          </ReferenceManyField>
        )}
      </CardContent>
      <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SendCampaignButton />
      </CardActions>
    </Card>
  )
}

const EmailCampaignForm = (props) => (
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
                label="Name"
                margin="none"
                variant="standard"
                fullWidth
                source="name"
                validate={required()}
              />
            }
            ratio={20}
          />
          <Spacer />
          <TwoElementRow
            left={
              <SelectInput
                margin="none"
                label="Email Template"
                variant="standard"
                fullWidth
                source="template"
                validate={required()}
                translateChoice={false}
                defaultValue="all_users_message"
                choices={[
                  { id: 'all_users_message', name: 'Message all users' },
                  {
                    id: 'inactive_users_reminder',
                    name: 'Remind inactive users to log in',
                  },
                ]}
              />
            }
            right={
              <SelectInput
                variant="standard"
                fullWidth
                disabled
                margin="none"
                source="status"
                translateChoice={false}
                choices={[
                  { id: 'CREATED', name: 'Created' },
                  { id: 'SENT', name: 'Sent' },
                ]}
              />
            }
            ratio={80}
          />
          <PreviewEmailCard />
          <CampaignMessagesCard />
        </Box>
        {/*admin*/}
        <Box flex={20} ml="2rem">
          <Typography variant="h6" gutterBottom>
            Admin
          </Typography>
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

export default EmailCampaignForm
