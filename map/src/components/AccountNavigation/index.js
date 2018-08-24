import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import Dropdown from '../DropdownMenu/index'
import { EDIT_USER_ACCOUNT, EDIT_USER_PASSWORD } from '../../AppRouter'
import i18n from '../../i18n'

const AccountNavDropdown = ({ onSignOutClick }) => (
  <ul>
    <li>
      <Link to={EDIT_USER_ACCOUNT}>{i18n.t('nav.edit_account')}</Link>
    </li>
    <li>
      <Link to={EDIT_USER_PASSWORD}>{i18n.t('nav.edit_password')}</Link>
    </li>
    <li>
      <button
        className="account-nav-signout"
        onClick={() => onSignOutClick()}
        rel="nofollow"
      >
        {i18n.t('nav.logout')}
      </button>
    </li>
  </ul>
)
AccountNavDropdown.propTypes = {
  onSignOutClick: PropTypes.func.isRequired
}

const AccountNav = ({ username, onSignOutClick }) => (
  <Dropdown
    className="account-nav"
    label={username}
    labelClassName="account-nav-toggle"
    menuComponent={AccountNavDropdown({ onSignOutClick })}
  />
)

AccountNav.propTypes = {
  onSignOutClick: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired
}

export default AccountNav
