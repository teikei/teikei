import React from 'react'
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
      phone = `${firstOwnerPhone}`
    }
  }
  return phone
}

function getUrl(place) {
  if (place.url) {
    return (<div>Website: <a href="{place.url}" target="_blank" rel="noopener noreferrer">{place.url}</a></div>)
  }
  return ''
}

const ContactTab = ({ onContactSubmit, place, initialValues }) => (
  <div id="contact">
    <h4>Kontakt</h4>
    <strong>{getContactName(place)}</strong>
    <div>
      {getContactPhone(place)}
    </div>
    {getUrl(place)}
    <div id="place-message-form-container">
      <ContactForm onSubmit={onContactSubmit} initialValues={initialValues} />
    </div>
  </div>
)

ContactTab.propTypes = {
  place: React.PropTypes.shape({
    url: React.PropTypes.string,
    ownerships: React.PropTypes.array.isRequired,
  }).isRequired,
  onContactSubmit: React.PropTypes.func.isRequired,
  initialValues: React.PropTypes.object.isRequired,
}

export default ContactTab
