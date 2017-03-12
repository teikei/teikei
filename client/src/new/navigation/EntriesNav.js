import React from 'react'
import { Link } from 'react-router'
import { MY_ENTRIES, NEW_FARM, NEW_DEPOT } from '../AppRouter'

class EntriesNav extends React.Component {

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
      <div className="entries-nav">
        <button className="entries-nav-toggle">{I18n.t('nav.new_entry')}</button>
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
    )
  }
}

EntriesNav.propTypes = {
  onSignOutClick: React.PropTypes.func.isRequired,
  onEditClick: React.PropTypes.func.isRequired,
  username: React.PropTypes.string.isRequired,
}

export default EntriesNav
