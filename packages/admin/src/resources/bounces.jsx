import {
  Button,
  Datagrid,
  List,
  TextField,
  useRecordContext
} from 'react-admin'
import { Link } from 'react-router-dom'

import Pagination from '../components/Pagination'

const TITLE = 'Bounces'

const EditUserButton = () => {
  const { id } = useRecordContext()
  return <Button component={Link} to={`/admin/users/${id}`} label='open user' />
}

export const BouncesList = (props) => {
  return (
    <List
      {...props}
      title={TITLE}
      pagination={<Pagination />}
      exporter={false}
      perPage={25}
    >
      <Datagrid bulkActionButtons={false}>
        <TextField source='id' sortable={false} />
        <TextField source='name' sortable={false} />
        <TextField source='email' sortable={false} />
        <TextField source='bounceType' sortable={false} />
        <TextField source='bounceName' sortable={false} />
        <EditUserButton />
      </Datagrid>
    </List>
  )
}

export default BouncesList
