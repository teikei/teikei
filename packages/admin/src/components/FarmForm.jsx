/* eslint-disable react/jsx-handler-names */
import { Box, Toolbar, Typography } from '@mui/material'
import {
  AutocompleteArrayInput,
  BooleanInput,
  DateInput,
  Form,
  ListButton,
  NumberInput,
  ReferenceArrayInput,
  SaveButton,
  SelectArrayInput,
  SelectInput,
  TextInput
} from 'react-admin'
import Spacer from './Spacer'
import TwoElementRow from './TwoElementRow'

const FarmForm = (props) => (
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
                margin='none'
                variant='standard'
                source='id'
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
          <TextInput fullWidth margin='none' variant='standard' source='url' />
          <TwoElementRow
            left={
              <SelectInput
                fullWidth
                margin='none'
                variant='standard'
                source='acceptsNewMembers'
                choices={[
                  { id: 'yes', name: 'Yes' },
                  { id: 'no', name: 'No' },
                  { id: 'waitlist', name: 'Waitlist' }
                ]}
              />
            }
            right={
              <NumberInput
                variant='standard'
                fullWidth
                margin='none'
                source='maximumMembers'
              />
            }
          />
          <TwoElementRow
            left={
              <SelectInput
                variant='standard'
                fullWidth
                margin='none'
                source='foundedAtMonth'
                translateChoice={false}
                choices={[
                  { id: '1', name: 'JAN' },
                  { id: '2', name: 'FEB' },
                  { id: '3', name: 'MAR' },
                  { id: '4', name: 'APR' },
                  { id: '5', name: 'MAY' },
                  { id: '6', name: 'JUN' },
                  { id: '7', name: 'JUL' },
                  { id: '8', name: 'AUG' },
                  { id: '9', name: 'SEP' },
                  { id: '10', name: 'OKT' },
                  { id: '11', name: 'NOV' },
                  { id: '12', name: 'DEC' }
                ]}
              />
            }
            right={
              <NumberInput
                variant='standard'
                fullWidth
                margin='none'
                source='foundedAtYear'
              />
            }
          />
          <TextInput
            fullWidth
            multiline
            variant='standard'
            margin='none'
            source='additionalProductInformation'
          />
          <TextInput
            fullWidth
            variant='standard'
            multiline
            margin='none'
            source='participation'
          />
          <BooleanInput
            fullWidth
            variant='standard'
            margin='none'
            source='actsEcological'
          />
          <TextInput
            fullWidth
            variant='standard'
            multiline
            margin='none'
            source='economicalBehavior'
          />
          <Spacer />
          {/* <ReferenceArrayInput */}
          {/*  fullWidth */}
          {/*  variant="standard" */}
          {/*  source="products" */}
          {/*  margin="none" */}
          {/*  reference="admin/products" */}
          {/* > */}
          {/*  <SelectArrayInput optionText="name" /> */}
          {/* </ReferenceArrayInput> */}
          <ReferenceArrayInput
            variant='standard'
            source='badges'
            margin='none'
            reference='admin/badges'
          >
            <SelectArrayInput
              optionText='name'
              variant='standard'
              fullWidth
              translateChoice={false}
            />
          </ReferenceArrayInput>
          <ReferenceArrayInput
            variant='standard'
            source='depots'
            margin='none'
            reference='admin/depots'
          >
            <AutocompleteArrayInput
              optionText={(item) =>
                item ? `${item.id} - ${item.name}` : 'loading...'
              }
              translateChoice={false}
              fullWidth
              variant='standard'
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
            margin='none'
            disabled
            label='Created'
            source='createdAt'
          />
          <DateInput
            variant='standard'
            fullWidth
            margin='none'
            disabled
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
          style={{ marginRight: '2rem' }}
        />
        <SaveButton saving={props.saving} />
      </Box>
    </Toolbar>
  </Form>
)

export default FarmForm
