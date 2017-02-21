import React from 'react'

const UserNav = ({
  onSignOutClick, onEditClick, onMyEntriesClick,
  onAddDepotClick, onAddFarmClick, username,
}) => (
  <div>
    <div className="user-nav-main user-nav-toggle" data-dropdown-target="#user-menu-dropdown">
      <a href="#user-menu-dropdown" id="user-menu-toggle">{username}</a>
    </div>
    <ul className="dropdown user-nav-dropdown" id="user-menu-dropdown">
      <li className="user-nav-account">
        <a href="#" onClick={() => onEditClick()}>
          {I18n.t('nav.edit_account')}</a>
      </li>
      <li className="user-nav-signout">
        <a href="#" onClick={() => onSignOutClick()} rel="nofollow">{I18n.t('nav.logout')}</a>
      </li>
    </ul>
    {/* TODO: Move this into a separate component to not have this within the hamburger menu */}
    <div className="entries-nav" id="entries-nav">
      <ul>
        <li className="entries-nav-item entries-nav-list">
          <a id="my-entries" href="#" onClick={() => onMyEntriesClick()}>{I18n.t('nav.my_entries')}</a>
        </li>
        <li className="entries-nav-item entries-nav-new">
          <a href="#new-entry-dropdown" data-dropdown-target="#new-entry-dropdown">{I18n.t('nav.new_entry')}</a>
        </li>
      </ul>

      <ul className="dropdown entries-nav-dropdown" id="new-entry-dropdown">
        <li>
          <a id="add-depot" onClick={() => onAddDepotClick()} href="#">{I18n.t('nav.new_depot')}</a>
        </li>
        <li>
          <a id="add-farm" onClick={() => onAddFarmClick()} href="#">{I18n.t('nav.new_farm')}</a>
        </li>
      </ul>
    </div>
  </div>
)

UserNav.propTypes = {
  onSignOutClick: React.PropTypes.func.isRequired,
  onEditClick: React.PropTypes.func.isRequired,
  onMyEntriesClick: React.PropTypes.func.isRequired,
  onAddDepotClick: React.PropTypes.func.isRequired,
  onAddFarmClick: React.PropTypes.func.isRequired,
  username: React.PropTypes.string.isRequired,
}

export default UserNav
