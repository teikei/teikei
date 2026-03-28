import DefaultIcon from '@mui/icons-material/ViewList'
import { Menu, usePermissions } from 'react-admin'
import { hasAdminRole, hasSuperAdminRole } from '../authorization'

export const MENU_WIDTH = 240
export const CLOSED_MENU_WIDTH = 55

const AppMenu = () => {
  const { permissions } = usePermissions()

  return (
    <Menu>
      {hasAdminRole(permissions) && (
        <>
          <Menu.DashboardItem />
          <Menu.Item
            to='/admin/farms'
            primaryText='Farms'
            leftIcon={<DefaultIcon />}
          />
          <Menu.Item
            to='/admin/depots'
            primaryText='Depots'
            leftIcon={<DefaultIcon />}
          />
          <Menu.Item
            to='/admin/initiatives'
            primaryText='Initiatives'
            leftIcon={<DefaultIcon />}
          />
          <Menu.Item
            to='/admin/users'
            primaryText='Users'
            leftIcon={<DefaultIcon />}
          />
          <Menu.Item
            to='/admin/bounces'
            primaryText='Bounces'
            leftIcon={<DefaultIcon />}
          />
        </>
      )}
      {hasSuperAdminRole(permissions) && (
        <>
          <Menu.Item
            to='/admin/badges'
            primaryText='Badges'
            leftIcon={<DefaultIcon />}
          />
          <Menu.Item
            to='/admin/goals'
            primaryText='Goals'
            leftIcon={<DefaultIcon />}
          />
          <Menu.Item
            to='/admin/products'
            primaryText='Products'
            leftIcon={<DefaultIcon />}
          />
          <Menu.Item
            to='/admin/roles'
            primaryText='Roles'
            leftIcon={<DefaultIcon />}
          />
          <Menu.Item
            to='/admin/origins'
            primaryText='Origins'
            leftIcon={<DefaultIcon />}
          />
          <Menu.Item
            to='/admin/jobs'
            primaryText='Jobs'
            leftIcon={<DefaultIcon />}
          />
        </>
      )}
      {hasSuperAdminRole(permissions) && (
        <>
          <Menu.Item
            to='/admin/email-campaigns'
            primaryText='Email Campaigns'
            leftIcon={<DefaultIcon />}
          />
          <Menu.Item
            to='/admin/email-messages'
            primaryText='Email Messages'
            leftIcon={<DefaultIcon />}
          />
        </>
      )}
    </Menu>
  )
}

export default AppMenu
