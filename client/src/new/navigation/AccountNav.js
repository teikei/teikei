import React from 'react'
import Dropdown from './Dropdown'

const AccountNavDropdown = ({ onEditClick, onSignOutClick }) => (
  <ul>
    <li className="user-nav-account">
      <button onClick={() => onEditClick()}>{I18n.t('nav.edit_account')}</button>
    </li>
    <li className="user-nav-signout">
      <button onClick={() => onSignOutClick()} rel="nofollow">{I18n.t('nav.logout')}</button>
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
