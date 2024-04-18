import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import Alert from 'react-s-alert'
import { useDispatch } from 'react-redux'

import { setCountry } from './containers/Map/duck'
import { config } from './main'

const Layout = ({ children }) => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(setCountry(config.country))
  }, [])

  return (
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
}

Layout.propTypes = {
  children: PropTypes.element.isRequired
}

export default Layout
