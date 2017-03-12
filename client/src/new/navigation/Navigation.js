import React from 'react'
import { Link } from 'react-router'
import { SIGN_IN } from '../AppRouter'
import EntriesNav from './EntriesNav'
import AccountNav from './AccountNav'

const MemberNav = props => (
  <div>
    <EntriesNav {...props} />
    <AccountNav {...props} />
  </div>
)

const GuestNav = () => (
  <Link className="account-nav-login" to={SIGN_IN}>
    {I18n.t('nav.login')}
  </Link>
)

const Navigation = props => (
  <nav className="user-nav">
    { props.loggedIn ? MemberNav(props) : GuestNav() }
  </nav>
)

Navigation.propTypes = {
  loggedIn: React.PropTypes.bool.isRequired,
}

export default Navigation
