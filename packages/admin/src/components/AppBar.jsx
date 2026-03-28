import { Box } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { AppBar as RaAppBar, TitlePortal } from 'react-admin'

const useStyles = makeStyles({
  navLink: {
    color: '#ffffff',
    fontWeight: 'bold',
    textDecoration: 'none'
  },
  appBar: {
    backgroundColor: '#266050',
    color: 'white'
  }
})

const AppBar = (props) => {
  const classes = useStyles()
  return (
    <RaAppBar {...props} className={classes.appBar}>
      <Box flex='1'>
        <TitlePortal />
      </Box>
      {/* <a href="#/docs" className={classes.navLink}> */}
      {/*  API Docs */}
      {/* </a> */}
    </RaAppBar>
  )
}

export default AppBar
