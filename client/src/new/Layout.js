import React, { PropTypes } from 'react'
import Alert from 'react-s-alert';

const Layout = ({ children }) => (
  <div>
    {children}
    <Alert stack={{ limit: 3 }} position="top-left" timeout={5000} html effect="stackslide" />
  </div>
)

Layout.propTypes = {
  children: PropTypes.element.isRequired,
}

export default Layout
