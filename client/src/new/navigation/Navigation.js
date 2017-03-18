import React from 'react'
import { Link } from 'react-router'
import { SIGN_IN } from '../AppRouter'
import EntriesNav from './EntriesNav'
import AccountNav from './AccountNav'
import { i18n } from '../App'

const MemberNav = props => (
  <div className="user-nav">
    <EntriesNav {...props} />
    <AccountNav {...props} />
  </div>
)

const GuestNav = () => (
  <Link className="account-nav-login" to={SIGN_IN}>
    {i18n.t('nav.edit_entries')}
  </Link>
)

const Navigation = props => (
  <nav className="app-nav">
    { props.loggedIn ? MemberNav(props) : GuestNav() }
  </nav>
)

Navigation.propTypes = {
  loggedIn: React.PropTypes.bool.isRequired,
}

export default Navigation
