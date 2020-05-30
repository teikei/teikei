import React from 'react'
import PropTypes from 'prop-types'
import Alert from 'react-s-alert'

const Layout = ({ children }) => (
  <div>
    {children}
    <Alert
      stack={{ limit: 3 }}
      position="top-left"
      timeout={5000}
      effect="stackslide"
      offset={80}
      html
    />
  </div>
)

Layout.propTypes = {
  children: PropTypes.element.isRequired,
}

export default Layout
