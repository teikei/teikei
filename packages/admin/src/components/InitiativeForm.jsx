import { Box, Toolbar, Typography } from '@mui/material'
import {
  AutocompleteArrayInput,
  BooleanInput,
  DateInput,
  Form,
  ListButton,
  ReferenceArrayInput,
  SaveButton,
  SelectArrayInput,
  TextInput
} from 'react-admin'
import Spacer from './Spacer'
import TwoElementRow from './TwoElementRow'

const InitiativeForm = (props) => (
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
                margin='none'
                variant='standard'
                fullWidth
                source='name'
              />
            }
            ratio={20}
          />
          <Spacer />
          <TwoElementRow
            left={
              <TextInput
                margin='none'
                variant='standard'
                fullWidth
                source='address'
              />
            }
            right={
              <TextInput
                variant='standard'
                fullWidth
                margin='none'
                source='housenumber'
              />
            }
            ratio={80}
          />
          <TwoElementRow
            left={
              <TextInput
                margin='none'
                variant='standard'
                fullWidth
                source='postalcode'
              />
            }
            right={
              <TextInput
                margin='none'
                variant='standard'
                fullWidth
                source='city'
              />
            }
            ratio={20}
          />
          <TwoElementRow
            left={
              <TextInput
                margin='none'
                variant='standard'
                fullWidth
                source='state'
              />
            }
            right={
              <TextInput
                margin='none'
                variant='standard'
                fullWidth
                source='country'
              />
            }
          />
          <Spacer />
          <TextInput
            fullWidth
            variant='standard'
            multiline
            margin='none'
            source='description'
          />
          <TextInput margin='none' fullWidth variant='standard' source='url' />
          <Spacer />
          <ReferenceArrayInput
            fullWidth
            variant='standard'
            source='badges'
            margin='none'
            reference='admin/badges'
          >
            <SelectArrayInput
              sx={{ width: '100%' }}
              optionText='name'
              translateChoice={false}
              variant='standard'
            />
          </ReferenceArrayInput>
          <ReferenceArrayInput
            fullWidth
            margin='none'
            source='goals'
            reference='admin/goals'
          >
            <SelectArrayInput
              optionText='name'
              variant='standard'
              sx={{ width: '100%' }}
            />
          </ReferenceArrayInput>
        </Box>
        {/* admin */}
        <Box flex={20} ml='2rem'>
          <Typography variant='h6' gutterBottom>
            Admin
          </Typography>
          <BooleanInput
            margin='none'
            variant='standard'
            fullWidth
            source='active'
          />
          <ReferenceArrayInput
            margin='none'
            fullWidth
            source='ownerships'
            reference='admin/users'
          >
            <AutocompleteArrayInput
              translateChoice={false}
              optionText='email'
              variant='standard'
            />
          </ReferenceArrayInput>
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

export default InitiativeForm
