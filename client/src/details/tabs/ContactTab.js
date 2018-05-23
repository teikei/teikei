import React, { PropTypes } from 'react'
import ContactForm from './ContactForm'

const ContactTab = ({ onContactSubmit, initialValues }) => (
  <div id="contact">
    <div id="place-message-form-container">
      <ContactForm onSubmit={onContactSubmit} initialValues={initialValues} />
    </div>
  </div>
)

ContactTab.propTypes = {
  onContactSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape().isRequired
}

export default ContactTab
