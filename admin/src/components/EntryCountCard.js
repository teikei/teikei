import * as React from 'react'
import { Card, Box, Typography, makeStyles } from '@material-ui/core'
import { Link } from 'react-router-dom'

// import cartouche from './cartouche.png';
// import cartoucheDark from './cartoucheDark.png';

import farmIcon from '../assets/marker-farm.svg'
import initiativeIcon from '../assets/marker-initiative.svg'
import depotIcon from '../assets/marker-depot.svg'

const icons = {
  Farms: farmIcon,
  Initiatives: initiativeIcon,
  Depots: depotIcon,
}

const useStyles = makeStyles((theme) => ({
  card: {
    minHeight: 52,
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    '& a': {
      textDecoration: 'none',
      color: 'inherit',
    },
  },
  main: (props) => ({
    overflow: 'inherit',
    padding: 16,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '& .icon': {
      color: theme.palette.type === 'dark' ? 'inherit' : '#dc2440',
    },
  }),
  title: {},
}))

const EntryCountCard = ({ name, link, title, count }) => {
  const classes = useStyles()
  return (
    <Card className={classes.card}>
      <Link to={link}>
        <div className={classes.main}>
          <Box width="3em" className="icon">
            <img src={icons[name]} />
          </Box>
          <Box textAlign="right">
            <Typography className={classes.title} color="textSecondary">
              {name}
            </Typography>
            <Typography variant="h5" component="h2">
              {count || ' '}
            </Typography>
          </Box>
        </div>
      </Link>
    </Card>
  )
}

export default EntryCountCard
