import React from 'react'
import PropTypes from 'prop-types'
import timeago from 'timeago'

const Footer = (props) => (
  <footer>
    Letzte Aktualisierung:
    {timeago(props.feature.updatedAt)}
  </footer>
)

Footer.propTypes = {
  feature: PropTypes.shape({
    updatedAt: PropTypes.string
  }).isRequired
}

export default Footer
