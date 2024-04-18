import { AppBar as RaAppBar } from "react-admin"
import { Box } from "@mui/material"
import Typography from "@mui/material/Typography"
import { makeStyles } from "@mui/styles"

const useStyles = makeStyles({
  navLink: {
    color: "#ffffff",
    fontWeight: "bold",
    textDecoration: "none",
  },
  appBar: {
    backgroundColor: "#266050",
    color: "white",
  },
})

const AppBar = (props) => {
  const classes = useStyles()
  return (
    <RaAppBar {...props} className={classes.appBar}>
      <Box flex="1">
        <Typography variant="h6" id="react-admin-title" />
      </Box>
      {/*<a href="#/docs" className={classes.navLink}>*/}
      {/*  API Docs*/}
      {/*</a>*/}
    </RaAppBar>
  )
}

export default AppBar
