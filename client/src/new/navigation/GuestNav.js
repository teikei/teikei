import React from 'react'
import { Link } from 'react-router'
import { SIGN_IN } from '../AppRouter'

const GuestNav = () => (
  <div className="user-nav-main">
    <Link to={SIGN_IN}>{I18n.t('nav.login')}</Link>
  </div>
)

export default GuestNav
