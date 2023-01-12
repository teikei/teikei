/* eslint-disable react/jsx-handler-names */
import {
  AutocompleteInput,
  Button,
  Datagrid,
  DateField,
  DateInput,
  FormWithRedirect,
  ListButton,
  ReferenceInput,
  ReferenceManyField,
  SaveButton,
  SelectInput,
  TextField,
  TextInput,
} from 'react-admin'
import { Box, Toolbar, Typography } from '@material-ui/core'
import TwoElementRow from './TwoElementRow'
import Spacer from './Spacer'
import SendIcon from '@material-ui/icons/Send'

const InitiativeForm = (props) => (
  <FormWithRedirect
    {...props}
    render={(formProps) => (
      <form>
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
              <Spacer />
              <TwoElementRow
                left={
                  <TextInput
                    margin="none"
                    variant="standard"
                    fullWidth
                    source="template"
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
                      { id: 'CREATED', name: 'Created' },
                      { id: 'SENDING', name: 'Sending' },
                      { id: 'COMPLETED', name: 'Completed' },
                    ]}
                  />
                }
                ratio={80}
              />
              <h4>Messages</h4>
              <ReferenceManyField
                label="Messages"
                reference="admin/email-messages"
                target="campaignId"
              >
                <Datagrid>
                  <TextField source="id" />
                  {/*<TextField source="userId" />*/}
                  <ReferenceInput
                    margin="none"
                    fullWidth
                    variant="standard"
                    source="userId"
                    reference="admin/users"
                  >
                    <AutocompleteInput
                      translateChoice={false}
                      optionText="email"
                      disabled
                    />
                  </ReferenceInput>
                  <TextField source="status" />
                  <DateField source="sentAt" />
                </Datagrid>
              </ReferenceManyField>
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
              <Button
                variant="contained"
                label="Send Campaign"
                startIcon={<SendIcon />}
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
              saving={formProps.saving}
              handleSubmitWithRedirect={formProps.handleSubmitWithRedirect}
            />
          </Box>
        </Toolbar>
      </form>
    )}
  />
)

export default InitiativeForm
