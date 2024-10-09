import { Link } from 'react-router-dom'
import Dropdown from '../DropdownMenu/index'
import { EDIT_USER_ACCOUNT, EDIT_USER_PASSWORD } from '../../routes'
import i18n from '../../i18n'

interface AccountNavDropdownProps {
  onSignOutClick: () => void
}

const AccountNavDropdown = ({ onSignOutClick }: AccountNavDropdownProps) => (
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

interface AccountNavProps {
  username: string
  onSignOutClick: () => void
}

const AccountNav = ({ username, onSignOutClick }: AccountNavProps) => (
  <Dropdown
    className='account-nav'
    label={username}
    labelClassName='account-nav-toggle'
    menuComponent={<AccountNavDropdown onSignOutClick={onSignOutClick} />}
  />
)

export default AccountNav
