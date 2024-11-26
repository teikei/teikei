import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { EDIT_USER_ACCOUNT, EDIT_USER_PASSWORD } from '../../routes'
import Dropdown from '../base/DropdownMenu'

interface AccountNavigationDropdownProps {
  onSignOutClick: () => void
}

const AccountNavigationDropdown = ({
  onSignOutClick
}: AccountNavigationDropdownProps) => {
  const { t } = useTranslation()
  return (
    <ul>
      <li>
        <Link to={EDIT_USER_ACCOUNT}>{t('nav.edit_account')}</Link>
      </li>
      <li>
        <Link to={EDIT_USER_PASSWORD}>{t('nav.edit_password')}</Link>
      </li>
      <li>
        <button
          className='account-nav-signout'
          onClick={() => onSignOutClick()}
          rel='nofollow'
        >
          {t('nav.logout')}
        </button>
      </li>
    </ul>
  )
}

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
