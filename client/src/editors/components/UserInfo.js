import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { EDIT_USER_ACCOUNT } from '../../AppRouter'

const UserInfo = ({ user }) => (
  <fieldset className="entries-editor-user-info">
    <legend>Kontaktdaten</legend>
    <label htmlFor="contact-data">Deine Kontaktdaten</label>
    <dl id="contact-data" className="entries-editor-listing">
      <dt>Name:</dt>
      <dd>{user.name}</dd>
      <dt>Email:</dt>
      <dd>{user.email}</dd>
      <dt>Telefon:</dt>
      <dd>{user.phone || '–'}</dd>
    </dl>
    <p className="entries-editor-explanation">
      <Link target="_blank" to={EDIT_USER_ACCOUNT}>
        Kontaktdaten ändern
      </Link>
    </p>
  </fieldset>
)

UserInfo.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
  }).isRequired,
}

export default UserInfo
