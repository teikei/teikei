/* eslint-disable react/jsx-handler-names */
import {
  Form,
  ListButton,
  SaveButton,
  SelectInput,
  TextInput,
} from 'react-admin'
import { Box, Toolbar } from '@mui/material'
import TwoElementRow from './TwoElementRow'
import Spacer from './Spacer'

const BadgesForm = (props) => (
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
                source="url"
              />
            }
            right={
              <SelectInput
                margin="none"
                variant="standard"
                fullWidth
                source="category"
                choices={[{ id: 'associations', name: 'Associations' }]}
              />
            }
          />
          <TwoElementRow
            left={
              <TextInput
                margin="none"
                variant="standard"
                fullWidth
                source="logo"
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
        </Box>
        {/*admin*/}
        <Box flex={20} ml="2rem" />
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

export default BadgesForm
