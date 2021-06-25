import { Card as MuiCard, CardContent, withStyles } from '@material-ui/core'

const Card = withStyles((theme) => ({
  root: {
    [theme.breakpoints.up('sm')]: {
      order: -1, // display on the left rather than on the right of the list
      width: '15em',
      marginRight: '1em',
    },
  },
}))(MuiCard)

const FarmsFilterSidebar = ({ children }) => (
  <Card>
    <CardContent>{children}</CardContent>
  </Card>
)

export default FarmsFilterSidebar
