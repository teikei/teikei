/* eslint-disable react/jsx-handler-names */
import {
  AutocompleteArrayInput,
  BooleanInput,
  DateInput,
  Form,
  ListButton,
  ReferenceArrayInput,
  SaveButton,
  TextInput,
} from 'react-admin'
import { Box, Toolbar, Typography } from '@mui/material'
import TwoElementRow from './TwoElementRow'
import Spacer from './Spacer'

const DepotForm = (props) => (
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
          <Spacer />
          <TwoElementRow
            left={
              <TextInput
                margin="none"
                variant="standard"
                fullWidth
                source="address"
              />
            }
            right={
              <TextInput
                variant="standard"
                fullWidth
                margin="none"
                source="housenumber"
              />
            }
            ratio={80}
          />
          <TwoElementRow
            left={
              <TextInput
                margin="none"
                variant="standard"
                fullWidth
                source="postalcode"
              />
            }
            right={
              <TextInput
                margin="none"
                variant="standard"
                fullWidth
                source="city"
              />
            }
            ratio={20}
          />
          <TwoElementRow
            left={
              <TextInput
                margin="none"
                variant="standard"
                fullWidth
                source="state"
              />
            }
            right={
              <TextInput
                margin="none"
                variant="standard"
                fullWidth
                source="country"
              />
            }
          />
          <Spacer />
          <TextInput
            fullWidth
            variant="standard"
            multiline
            margin="none"
            source="description"
          />
          <TextInput margin="none" fullWidth variant="standard" source="url" />
          <TextInput
            fullWidth
            margin="none"
            multiline
            variant="standard"
            source="deliveryDays"
          />
          <Spacer />
          <ReferenceArrayInput
            fullWidth
            variant="standard"
            source="farms"
            margin="none"
            reference="admin/farms"
          >
            <AutocompleteArrayInput
              optionText={(item) =>
                item ? `${item.id} - ${item.name}` : 'loading...'
              }
              variant="standard"
              translateChoice={false}
            />
          </ReferenceArrayInput>
        </Box>
        {/*admin*/}
        <Box flex={20} ml="2rem">
          <Typography variant="h6" gutterBottom>
            Admin
          </Typography>
          <BooleanInput
            margin="none"
            variant="standard"
            fullWidth
            source="active"
          />
          <ReferenceArrayInput
            margin="none"
            fullWidth
            source="ownerships"
            reference="admin/users"
          >
            <AutocompleteArrayInput
              translateChoice={false}
              optionText="email"
              variant="standard"
            />
          </ReferenceArrayInput>
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

export default DepotForm
