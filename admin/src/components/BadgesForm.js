import {
  FormWithRedirect,
  ListButton,
  SaveButton,
  SelectInput,
  TextInput,
} from 'react-admin'
import { Box, Toolbar, Typography } from '@material-ui/core'
import TwoElementRow from './TwoElementRow'
import Spacer from './Spacer'

const BadgesForm = (props) => (
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
            <Box flex={20} ml="2rem">
              {/*<Typography variant="h6" gutterBottom>*/}
              {/*  Admin*/}
              {/*</Typography>*/}
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

export default BadgesForm
