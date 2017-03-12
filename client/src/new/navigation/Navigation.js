import React from 'react'
import EntriesNav from './EntriesNav'
import GuestNav from './GuestNav'
import AccountNav from './AccountNav'

const Navigation = props => (
  <nav className="user-nav">
    { props.loggedIn ? <EntriesNav {...props} /> : <GuestNav {...props} /> }
    { props.loggedIn && <AccountNav {...props} /> }
  </nav>
)

Navigation.propTypes = {
  loggedIn: React.PropTypes.bool.isRequired,
}

export default Navigation
