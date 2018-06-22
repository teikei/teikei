import React from 'react'
import PropTypes from 'prop-types'
import timeago from 'timeago'

const Footer = props => (
  <footer>Letzte Aktualisierung: {timeago(props.place.updated_at)}</footer>
)

Footer.propTypes = {
  place: PropTypes.shape({
    updated_at: PropTypes.string
  }).isRequired
}

export default Footer
