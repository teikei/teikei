import React from 'react'
import browserHistory from '../../browserHistory'

const handleSignInClick = () => browserHistory.push('/new/users/sign_in')

const Navigation = () => (
  <div className="main-navigation" id="navigation">
    <nav className="user-nav">
      <ul>
        <li className="user-nav-settings" id="user-menu">
          <div className="user-nav-main">
            <a href="#" id="signin" onClick={() => handleSignInClick()}>{I18n.t('nav.login')}</a>
          </div>
        </li>
      </ul>
    </nav>
  </div>
)

export default Navigation
