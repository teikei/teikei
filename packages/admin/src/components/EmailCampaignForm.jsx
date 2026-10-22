import {
  Box,
  Card,
  CardActions,
  CardContent,
  Toolbar,
  Typography
} from '@mui/material'
import {
  AutocompleteInput,
  DateInput,
  Form,
  ListButton,
  ReferenceInput,
  required,
  SaveButton,
  SelectInput,
  TextInput,
  useRecordContext
} from 'react-admin'
import SendTestEmailButton from './SendTestEmailButton'
import Spacer from './Spacer'
import TwoElementRow from './TwoElementRow'

const PreviewEmailCard = () => (
  <Card sx={{ backgroundColor: '#fffcf9', borderRadius: 0 }}>
    <CardContent sx={{ padding: '8px' }}>
      <h3 style={{ margin: '0' }}>Preview</h3>
      <ReferenceInput reference='admin/users' source='userId'>
        <AutocompleteInput
          translateChoice={false}
          optionText='email'
          variant='standard'
          label='Test Email Recipient'
          name='testEmailUser'
        />
      </ReferenceInput>
    </CardContent>
    <CardActions sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <SendTestEmailButton />
    </CardActions>
  </Card>
)

const CampaignMessagesCard = () => {
  const record = useRecordContext()
  if (!record) {
    return null
  }

  return (
    <Card
      sx={{
        backgroundColor: '#fffcf9',
        borderRadius: 0,
        marginTop: '16px'
      }}
    >
      <CardContent sx={{ padding: '8px' }}>
        <h3 style={{ margin: '0' }}>Messages</h3>
        <br />
        <a
          href={`#/admin/email-messages?filter=${JSON.stringify({
            campaignId: record.id
          })}&perPage=10&sort=id&order=ASC&page=1`}
          style={{ color: '#266050', textDecoration: 'none' }}
        >
          Go to campaign messages
        </a>
      </CardContent>
    </Card>
  )
}

const EmailCampaignForm = (props) => (
  <Form {...props}>
    <Box p='1em'>
      <Box display='flex'>
        {/* main */}
        <Box flex={80} mr='2rem'>
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
                label='Name'
                margin='none'
                variant='standard'
                fullWidth
                source='name'
                validate={required()}
              />
            }
            ratio={20}
          />
          <Spacer />
          <TwoElementRow
            left={
              <TextInput
                margin='none'
                label='Email Template'
                variant='standard'
                fullWidth
                source='template'
                disabled
              />
            }
            right={
              <SelectInput
                variant='standard'
                fullWidth
                disabled
                margin='none'
                source='status'
                translateChoice={false}
                choices={[
                  { id: 'CREATED', name: 'Created' },
                  { id: 'SENT', name: 'Sent' }
                ]}
              />
            }
            ratio={80}
          />
          <PreviewEmailCard />
          <CampaignMessagesCard />
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

export default EmailCampaignForm
