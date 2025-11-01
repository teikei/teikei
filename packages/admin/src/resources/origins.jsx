import { Datagrid, List, TextField } from 'react-admin'

import Pagination from '../components/Pagination'

const TITLE = 'Origins'

export const OriginsList = (props) => (
  <List {...props} title={TITLE} pagination={<Pagination />} perPage={25}>
    <Datagrid bulkActionButtons={false}>
      <TextField source='id' />
      <TextField source='origin' />
      <TextField source='baseurl' />
      <TextField source='originName' />
      <TextField source='organizationName' />
      <TextField source='organizationEmail' />
    </Datagrid>
  </List>
)
