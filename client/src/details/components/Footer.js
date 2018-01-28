import React, { PropTypes } from 'react'
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
