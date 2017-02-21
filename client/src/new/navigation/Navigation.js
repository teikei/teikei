import React from 'react'
import UserNav from './UserNav'
import GuestNav from './GuestNav'

const Navigation = props => (
  <div className="main-navigation" id="navigation">
    <nav className="user-nav">
      <ul>
        <li className="user-nav-settings" id="user-menu">
          {props.loggedIn ? <UserNav {...props} /> : <GuestNav {...props} /> }
        </li>
      </ul>
    </nav>
  </div>
)

Navigation.propTypes = {
  loggedIn: React.PropTypes.bool.isRequired,
}

export default Navigation
