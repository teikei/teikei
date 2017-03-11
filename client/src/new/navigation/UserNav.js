import React from 'react'
import { Link } from 'react-router'
import { MY_ENTRIES, NEW_FARM, NEW_DEPOT } from '../AppRouter'

class UserNav extends React.Component {

  constructor(props) {
    super(props);
    this.state = { toggleUserNav: false }
  }

  toggleUserNav = (event) => {
    event.preventDefault();
    this.setState({
      toggleUserNav: !this.state.toggleUserNav,
    })
  }

  render() {
    return (
      <div>
        <div className="entries-nav">
          <ul>
            <li className="entries-nav-item entries-nav-new">
              <a href="#new-entry-dropdown">{I18n.t('nav.new_entry')}</a>
            </li>
          </ul>

          <ul className="dropdown entries-nav-dropdown">
            <li>
              <Link to={MY_ENTRIES}>{I18n.t('nav.my_entries')}</Link>
            </li>
            <li>
              <Link to={NEW_DEPOT}>{I18n.t('nav.new_depot')}</Link>
            </li>
            <li>
              <Link to={NEW_FARM}>{I18n.t('nav.new_farm')}</Link>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}

UserNav.propTypes = {
  onSignOutClick: React.PropTypes.func.isRequired,
  onEditClick: React.PropTypes.func.isRequired,
  username: React.PropTypes.string.isRequired,
}

export default UserNav
