import React from 'react'
import Dropdown from './Dropdown'
import { i18n } from '../App'

const AccountNavDropdown = ({ onEditClick, onSignOutClick }) => (
  <ul>
    <li>
      <button className="account-nav-edit" onClick={() => onEditClick()}>
        {i18n.t('nav.edit_account')}
      </button>
    </li>
    <li>
      <button className="account-nav-signout" onClick={() => onSignOutClick()} rel="nofollow">
        {i18n.t('nav.logout')}
      </button>
    </li>
  </ul>
)
AccountNavDropdown.propTypes = {
  onSignOutClick: React.PropTypes.func.isRequired,
  onEditClick: React.PropTypes.func.isRequired,
}

const AccountNav = ({ username, onEditClick, onSignOutClick }) => (
  <Dropdown
    className="account-nav"
    label={username}
    labelClassName="account-nav-toggle"
    menuComponent={AccountNavDropdown({ onEditClick, onSignOutClick })}
  />
)

AccountNav.propTypes = {
  onSignOutClick: React.PropTypes.func.isRequired,
  onEditClick: React.PropTypes.func.isRequired,
  username: React.PropTypes.string.isRequired,
}

export default AccountNav
