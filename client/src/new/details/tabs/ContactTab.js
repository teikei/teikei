import React, { PropTypes } from 'react'
import ContactForm from './ContactForm'

function getContactName(place) {
  let name = ''
  if (place.ownerships.length > 0) {
    name = `${place.ownerships[0].name}`
  }
  return name
}

function getContactPhone(place) {
  let phone = ''
  if (place.ownerships.length > 0) {
    const firstOwnerPhone = place.ownerships[0].phone
    if (firstOwnerPhone) {
      phone = ` / ${firstOwnerPhone}`
    }
  }
  return phone
}

const ContactTab = ({ onContactSubmit, place, initialValues }) => (
  <div id="contact">
    <p>
      <b>Kontakt:</b> {getContactName(place)} {getContactPhone(place)}
    </p>
    <div id="place-message-form-container">
      <ContactForm onSubmit={onContactSubmit} initialValues={initialValues} />
    </div>
  </div>
)

ContactTab.propTypes = {
  place: PropTypes.shape({
    url: PropTypes.string,
    ownerships: PropTypes.array.isRequired,
  }).isRequired,
  onContactSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape().isRequired,
}

export default ContactTab
