import { MenuItemLink, DashboardMenuItem, usePermissions } from 'react-admin'
import { hasAdminRole, hasSuperAdminRole } from '../authorization'
import DefaultIcon from '@material-ui/icons/ViewList'
import { makeStyles } from '@material-ui/core/styles'
import classnames from 'classnames'
import _ from 'lodash'

export const MENU_WIDTH = 240
export const CLOSED_MENU_WIDTH = 55

const useStyles = makeStyles(
  (theme) => ({
    main: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      marginTop: '0.5em',
      [theme.breakpoints.only('xs')]: {
        marginTop: 0,
      },
      [theme.breakpoints.up('md')]: {
        marginTop: '1.5em',
      },
    },
    open: {
      width: _.get(theme, 'menu.width', MENU_WIDTH),
    },
    closed: {
      width: _.get(theme, 'menu.closedWidth', CLOSED_MENU_WIDTH),
    },
  }),
  { name: 'RaMenu' }
)

const AppMenu = (props) => {
  const { permissions } = usePermissions()
  const classes = useStyles(props)
  const { onMenuClick, className } = props
  return (
    <div
      className={classnames(
        classes.main,
        {
          [classes.open]: open,
          [classes.closed]: !open,
        },
        className
      )}
    >
      {hasAdminRole(permissions) && (
        <>
          <DashboardMenuItem
            to="/"
            primaryText="Dashboard"
            onClick={onMenuClick}
          />
          <MenuItemLink
            to="/admin/farms"
            primaryText="Farms"
            onClick={onMenuClick}
            leftIcon={<DefaultIcon />}
          />
          <MenuItemLink
            to="/admin/depots"
            primaryText="Depots"
            onClick={onMenuClick}
            leftIcon={<DefaultIcon />}
          />
          <MenuItemLink
            to="/admin/initiatives"
            primaryText="Initiatives"
            onClick={onMenuClick}
            leftIcon={<DefaultIcon />}
          />
          <MenuItemLink
            to="/admin/users"
            primaryText="Users"
            onClick={onMenuClick}
            leftIcon={<DefaultIcon />}
          />
        </>
      )}
      {hasSuperAdminRole(permissions) && (
        <>
          <MenuItemLink
            to="/admin/badges"
            primaryText="Badges"
            onClick={onMenuClick}
          />
          <MenuItemLink
            to="/admin/goals"
            primaryText="Goals"
            onClick={onMenuClick}
          />
          <MenuItemLink
            to="/admin/products"
            primaryText="Products"
            onClick={onMenuClick}
          />
          <MenuItemLink
            to="/admin/roles"
            primaryText="Roles"
            onClick={onMenuClick}
          />
        </>
      )}
    </div>
  )
}

export default AppMenu
