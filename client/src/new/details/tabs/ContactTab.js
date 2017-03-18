import React from 'react'
import { i18n } from '../../App'

function getContactName(place) {
  let name = ''
  if (place.ownerships.length > 0) {
    name = `${i18n.t('forms.labels.name')}: ${place.ownerships[0].name}`
  }
  return name
}

function getContactPhone(place) {
  let phone = ''
  if (place.ownerships.length > 0) {
    const firstOwnerPhone = place.ownerships[0].phone
    if (firstOwnerPhone) {
      phone = `${i18n.t('forms.labels.phone')}: ${firstOwnerPhone}`
    }
  }
  return phone
}

function getUrl(place) {
  if (place.url) {
    return (<div>Website: <a href="<%= url %>" target="_blank" rel="noopener noreferrer">{place.url}</a></div>)
  }
  return ''
}

const ContactTab = props => (
  <li className={`tab-content ${props.active}`} id="contact">
    <h4>Kontakt</h4>
    <strong>{getContactName(props.place)}</strong>
    <div>
      {getContactPhone(props.place)}
    </div>
    {getUrl(props.place)}
    <div id="place-message-form-container" />
  </li>
)

ContactTab.propTypes = {
  place: React.PropTypes.shape({
    url: React.PropTypes.string.isRequired,
    ownerships: React.PropTypes.array.isRequired,
  }).isRequired,
  active: React.PropTypes.string.isRequired,
};

export default ContactTab
