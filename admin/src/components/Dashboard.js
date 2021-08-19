import { Grid, makeStyles } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'

import { useVersion, useDataProvider } from 'react-admin'
import { useEffect, useState } from 'react'
import EntryCountCard from './EntryCountCard'
import { hasAdminRole } from '../authorization'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '16px',
  },
  paper: {
    color: theme.palette.text.secondary,
  },
}))

const Dashboard = ({ permissions }) => {
  const classes = useStyles()
  const dataProvider = useDataProvider()
  const version = useVersion()

  const [farmsTotal, setFarmsTotal] = useState([])
  const [initiativesTotal, setInitiativesTotal] = useState([])
  const [depotsTotal, setDepotsTotal] = useState([])

  const fetchFarms = async () => {
    const result = await dataProvider.getList('admin/farms', {
      sort: { field: 'createdAt', order: 'DESC' },
    })
    setFarmsTotal(result.total)
  }

  const fetchInitiatives = async () => {
    const result = await dataProvider.getList('admin/initiatives', {
      sort: { field: 'createdAt', order: 'DESC' },
    })
    setDepotsTotal(result.total)
  }

  const fetchDepots = async () => {
    const result = await dataProvider.getList('admin/depots', {
      sort: { field: 'createdAt', order: 'DESC' },
    })
    setInitiativesTotal(result.total)
  }

  useEffect(() => {
    fetchFarms()
    fetchInitiatives()
    fetchDepots()
  }, [version])

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
