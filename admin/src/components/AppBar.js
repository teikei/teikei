import { AppBar as RaAppBar } from 'react-admin'
import { Box, makeStyles } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles({
  navLink: {
    color: '#ffffff',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
})

const AppBar = (props) => {
  const classes = useStyles()
  return (
    <RaAppBar {...props} style={{ backgroundColor: '#266050', color: 'white' }}>
      <Box flex="1">
        <Typography variant="h6" id="react-admin-title" />
      </Box>
      <a href="#/docs" className={classes.navLink}>
        API Docs
      </a>
    </RaAppBar>
  )
}

export default AppBar
