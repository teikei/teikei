import React, { PropTypes } from 'react'
import ContactForm from './ContactForm'

const ContactTab = ({ onContactSubmit, place, initialValues }) => (
  <div id="contact">
    <div id="place-message-form-container">
      <ContactForm onSubmit={onContactSubmit} initialValues={initialValues} />
    </div>
  </div>
)

ContactTab.propTypes = {
  place: PropTypes.shape({
    url: PropTypes.string
  }).isRequired,
  onContactSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape().isRequired
}

export default ContactTab
