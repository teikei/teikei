import { Link } from 'react-router-dom'

import Dropdown from '../base/DropdownMenu'
import { EDIT_USER_ACCOUNT, EDIT_USER_PASSWORD } from '../../routes'
import i18n from '../../i18n'

interface AccountNavigationDropdownProps {
  onSignOutClick: () => void
}

const AccountNavigationDropdown = ({
  onSignOutClick
}: AccountNavigationDropdownProps) => (
  <ul>
    <li>
      <Link to={EDIT_USER_ACCOUNT}>{i18n.t('nav.edit_account')}</Link>
    </li>
    <li>
      <Link to={EDIT_USER_PASSWORD}>{i18n.t('nav.edit_password')}</Link>
    </li>
    <li>
      <button
        className='account-nav-signout'
        onClick={() => onSignOutClick()}
        rel='nofollow'
      >
        {i18n.t('nav.logout')}
      </button>
    </li>
  </ul>
)

interface AccountNavigationProps {
  username: string
  onSignOutClick: () => void
}

const AccountNavigation = ({
  username,
  onSignOutClick
}: AccountNavigationProps) => (
  <Dropdown
    className='account-nav'
    label={username}
    labelClassName='account-nav-toggle'
    menuComponent={
      <AccountNavigationDropdown onSignOutClick={onSignOutClick} />
    }
  />
)

export default AccountNavigation
