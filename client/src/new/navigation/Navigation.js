import React from 'react'
import UserNav from './UserNav'
import GuestNav from './GuestNav'

const Navigation = props => (
  <nav className="user-nav">
    <ul>
      <li className="user-nav-settings" id="user-menu">
        {props.loggedIn ? <UserNav {...props} /> : <GuestNav {...props} /> }
      </li>
    </ul>
  </nav>
)

Navigation.propTypes = {
  loggedIn: React.PropTypes.bool.isRequired,
}

export default Navigation
