/* eslint-disable react/jsx-handler-names */
import {
  DateInput,
  Form,
  ListButton,
  SaveButton,
  SelectInput,
  TextInput,
} from 'react-admin'
import { Box, Toolbar, Typography } from '@mui/material'
import TwoElementRow from './TwoElementRow'
import Spacer from './Spacer'

const InitiativeForm = (props) => (
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
                source="userId"
              />
            }
            ratio={20}
          />
          <Spacer />
          <TwoElementRow
            left={
              <TextInput
                margin="none"
                variant="standard"
                fullWidth
                source="campaignId"
              />
            }
            right={
              <SelectInput
                variant="standard"
                fullWidth
                margin="none"
                source="status"
                translateChoice={false}
                choices={[
                  { id: 'PENDING', name: 'Pending' },
                  { id: 'SENT', name: 'Sent' },
                  { id: 'FAILED', name: 'Failed' },
                ]}
              />
            }
            ratio={80}
          />
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
          basePath={props.basePath}
          label="Cancel"
          icon={null}
          variant="filled"
          style={{ marginRight: '2rem' }}
        />
        <SaveButton
          saving={props.saving}
          handleSubmitWithRedirect={props.handleSubmitWithRedirect}
        />
      </Box>
    </Toolbar>
  </Form>
)

export default InitiativeForm
