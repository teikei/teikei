import React from 'react'
import timeago from 'timeago'

const Footer = props => (
  <footer>
    Letzte Aktualisierung: { timeago(props.place.updated_at) }
  </footer>
)

Footer.propTypes = {
  place: React.PropTypes.shape({
    updated_at: React.PropTypes.string,
  }).isRequired,
};


export default Footer
