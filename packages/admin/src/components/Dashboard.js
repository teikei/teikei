import { Grid } from '@mui/material'
import Typography from '@mui/material/Typography'
import { makeStyles } from '@mui/styles'

import { useDataProvider } from 'react-admin'
import { useEffect, useState } from 'react'
import EntryCountCard from './EntryCountCard'
import { hasAdminRole } from '../authorization'
import UserCountCard from './UserCountCard'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '16px',
  },
  paper: {
    color: theme.palette.text.secondary,
  },
}))

const findCountInStats = (stats, resource, state) => {
  if (state === undefined) {
    return stats.find((stat) => stat.resource === resource).stats.count
  }
  const stateCount = stats
    .find((stat) => stat.resource === resource)
    .stats.find((s) => s.state === state)
  return stateCount !== undefined ? stateCount.count : '0'
}

const Dashboard = ({ permissions }) => {
  const classes = useStyles()
  const dataProvider = useDataProvider()

  const [farmsTotal, setFarmsTotal] = useState([])
  const [initiativesTotal, setInitiativesTotal] = useState([])
  const [depotsTotal, setDepotsTotal] = useState([])
  const [userByStateTotal, setUserByStateTotal] = useState({})

  const fetchStats = async () => {
    const stats = await dataProvider.getList('admin/stats', {})

    setFarmsTotal(findCountInStats(stats, 'farms'))
    setInitiativesTotal(findCountInStats(stats, 'initiatives'))
    setDepotsTotal(findCountInStats(stats, 'depots'))
    setUserByStateTotal({
      ACTIVE: findCountInStats(stats, 'users', 'ACTIVE'),
      ACTIVE_REMINDER_SENT: findCountInStats(
        stats,
        'users',
        'ACTIVE_REMINDER_SENT'
      ),
      ACTIVE_SECOND_REMINDER_SENT: findCountInStats(
        stats,
        'users',
        'ACTIVE_SECOND_REMINDER_SENT'
      ),
      INACTIVE_NO_RESPONSE: findCountInStats(
        stats,
        'users',
        'INACTIVE_NO_RESPONSE'
      ),
    })
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return hasAdminRole(permissions) ? (
    <Grid container spacing={3} className={classes.root}>
      <Grid item xs={12}>
        <Typography variant="h4">Ernte Teilen Admin</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h5">Entries</Typography>
      </Grid>
      <Grid item xs={4}>
        <EntryCountCard count={farmsTotal} name="Farms" link="/admin/farms" />
      </Grid>
      <Grid item xs={4}>
        <EntryCountCard
          count={depotsTotal}
          name="Depots"
          link="/admin/depots"
        />
      </Grid>
      <Grid item xs={4}>
        <EntryCountCard
          count={initiativesTotal}
          name="Initiatives"
          link="/admin/initiatives"
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h5">Users</Typography>
      </Grid>
      <Grid item xs={12} md={6} xl={3}>
        <UserCountCard
          count={userByStateTotal.ACTIVE}
          name="Active"
          link={`/admin/users?${encodeURIComponent(
            'filter={"state":"ACTIVE"}'
          )}`}
        />
      </Grid>
      <Grid item xs={12} md={6} xl={3}>
        <UserCountCard
          count={userByStateTotal.ACTIVE_REMINDER_SENT}
          name="Reminder Sent"
          link={`/admin/users?${encodeURIComponent(
            'filter={"state":"ACTIVE_REMINDER_SENT"}'
          )}`}
        />
      </Grid>
      <Grid item xs={12} md={6} xl={3}>
        <UserCountCard
          count={userByStateTotal.ACTIVE_SECOND_REMINDER_SENT}
          name="Second Reminder Sent"
          link={`/admin/users?${encodeURIComponent(
            'filter={"state":"ACTIVE_SECOND_REMINDER_SENT"}'
          )}`}
        />
      </Grid>
      <Grid item xs={12} md={6} xl={3}>
        <UserCountCard
          count={userByStateTotal.INACTIVE_NO_RESPONSE}
          name="Inactive - No Response"
          link={`/admin/users?${encodeURIComponent(
            'filter={"state":"INACTIVE_NO_RESPONSE"}'
          )}`}
        />
      </Grid>
    </Grid>
  ) : (
    <Grid container spacing={3} className={classes.root}>
      <Grid item xs={12}>
        <Typography variant="h4">
          You are not authorized to access this page.
        </Typography>
      </Grid>
    </Grid>
  )
}

export default Dashboard
