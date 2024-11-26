import Typography from '@mui/material/Typography'
import cronstrue from 'cronstrue'
import {
  Button,
  Datagrid,
  DateField,
  List,
  TextField,
  useNotify,
  useRecordContext,
  useRefresh,
  useUpdate
} from 'react-admin'
import { useStatus } from '../App'
import Pagination from '../components/Pagination'

const TITLE = 'Jobs'

const RunButton = (props) => {
  const { id, name } = useRecordContext(props)
  const refresh = useRefresh()
  const [update] = useUpdate()
  const notify = useNotify()
  const handleRunJob = async () => {
    await update('admin/jobs', {
      id,
      data: {
        status: 'RUNNING'
      }
    })
    refresh()
    notify(`Job ${name} started`)
  }
  return <Button variant='contained' label='Run' onClick={handleRunJob} />
}

const CronExplanation = (props) => {
  const { cron } = useRecordContext(props)
  return (
    <Typography component='span' variant='body2'>
      {cronstrue.toString(cron)}
    </Typography>
  )
}

export const JobsList = (props) => {
  const {
    features: { runJobsFromAdminUi }
  } = useStatus()
  return (
    <List {...props} title={TITLE} pagination={<Pagination />} perPage={25}>
      <Datagrid bulkActionButtons={false} sort={false}>
        <TextField source='id' />
        <TextField source='name' />
        <TextField source='cron' />
        <CronExplanation />
        <DateField source='nextInvocation' showTime />
        {runJobsFromAdminUi === 'true' && <RunButton />}
      </Datagrid>
    </List>
  )
}
