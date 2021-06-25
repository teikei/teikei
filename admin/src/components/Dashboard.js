import { Card, Grid, makeStyles } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'

import { useVersion, useDataProvider } from 'react-admin'
import { useEffect, useState } from 'react'
import EntriesChart from './EntriesChart'
import EntryCountCard from './EntryCountCard'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '16px',
  },
  paper: {
    color: theme.palette.text.secondary,
  },
}))

const Dashboard = () => {
  const classes = useStyles()
  const dataProvider = useDataProvider()
  const version = useVersion()

  const [farms, setFarms] = useState([])
  const [farmsTotal, setFarmsTotal] = useState([])
  const [initiatives, setInitiatives] = useState([])
  const [initiativesTotal, setInitiativesTotal] = useState([])
  const [depots, setDepots] = useState([])
  const [depotsTotal, setDepotsTotal] = useState([])

  const fetchFarms = async () => {
    const result = await dataProvider.getList('admin/farms', {
      sort: { field: 'createdAt', order: 'DESC' },
    })
    setFarms(
      result.data.map((e) => ({
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      }))
    )
    setFarmsTotal(result.total)
  }

  const fetchInitiatives = async () => {
    const result = await dataProvider.getList('admin/initiatives', {
      sort: { field: 'createdAt', order: 'DESC' },
    })
    setInitiatives(result.data.map((e) => ({ createdAt: e.createdAt })))
    setDepotsTotal(result.total)
  }

  const fetchDepots = async () => {
    const result = await dataProvider.getList('admin/depots', {
      sort: { field: 'createdAt', order: 'DESC' },
    })
    setDepots(result.data.map((e) => ({ createdAt: e.createdAt })))
    setInitiativesTotal(result.total)
  }

  useEffect(() => {
    fetchFarms()
    fetchInitiatives()
    fetchDepots()
  }, [version])

  return (
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
        <Typography variant="h5">Statistics</Typography>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <EntriesChart entries={farms} title="Farms" />
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <EntriesChart entries={depots} title="Depots" />
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <EntriesChart entries={initiatives} title="Initiatives" />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Dashboard
