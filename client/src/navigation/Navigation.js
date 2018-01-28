import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { SIGN_IN } from '../AppRouter'
import EntriesNav from './EntriesNav'
import AccountNav from './AccountNav'
import i18n from '../i18n'
import config from '../configuration'

const MemberNav = props => (
  <div className="user-nav">
    <ul>
      <li>
        <EntriesNav {...props} />
      </li>
      <li>
        <AccountNav {...props} />
      </li>
      <li>{config.externalHelpUrl ? <HelpExternal /> : <HelpInternal />}</li>
    </ul>
  </div>
)

const GuestNav = () => (
  <div className="user-nav">
    <ul>
      <li>
        <Link className="account-nav-login" to={SIGN_IN}>
          {i18n.t('nav.edit_entries')}
        </Link>
      </li>
      <li>{config.externalHelpUrl ? <HelpExternal /> : <HelpInternal />}</li>
    </ul>
  </div>
)

const HelpInternal = () => (
  <Link className="button button-help" to="info">
    {i18n.t('nav.help')}
  </Link>
)

const HelpExternal = () => (
  <a
    className="button button-help"
    href={config.externalHelpUrl}
    target="_blank"
    rel="noopener noreferrer"
  >
    {i18n.t('nav.help')}
  </a>
)

const Navigation = props => (
  <nav>{props.loggedIn ? MemberNav(props) : GuestNav()}</nav>
)

Navigation.propTypes = {
  loggedIn: PropTypes.bool.isRequired
}

export default Navigation
