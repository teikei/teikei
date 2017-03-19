import React from 'react'
import { Link } from 'react-router'
import { SIGN_IN } from '../AppRouter'
import EntriesNav from './EntriesNav'
import AccountNav from './AccountNav'
import i18n from '../i18n'

const MemberNav = props => (
  <nav className="user-nav">
    <ul>
      <li><EntriesNav {...props} /></li>
      <li><AccountNav {...props} /></li>
    </ul>
  </nav>
)

const GuestNav = () => (
  <nav className="user-nav">
    <ul>
      <li>
        <Link className="account-nav-login" to={SIGN_IN}>
          {i18n.t('nav.edit_entries')}
        </Link>
      </li>
    </ul>
  </nav>
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
