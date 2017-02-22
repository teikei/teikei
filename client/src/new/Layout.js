import React from 'react'
import Alert from 'react-s-alert';

const Layout = ({ children }) => (
  <div>
    {children}
    <Alert stack={{ limit: 3 }} position="top-left" effect="stackslide" />
  </div>
)

Layout.propTypes = {
  children: React.PropTypes.element.isRequired,
}

export default Layout
