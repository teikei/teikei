import React from 'react'

const GuestNav = ({ onSignInClick }) => (
  <div className="user-nav-main">
    <a href="#" id="signin" onClick={() => onSignInClick()}>{I18n.t('nav.login')}</a>
  </div>
)

GuestNav.propTypes = {
  onSignInClick: React.PropTypes.func.isRequired,
}

export default GuestNav
