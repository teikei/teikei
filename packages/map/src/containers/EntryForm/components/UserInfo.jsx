import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { EDIT_USER_ACCOUNT } from '../../../AppRouter'

const UserInfo = ({ user }) => (
  <fieldset className='entries-editor-user-info'>
    <legend>Kontaktdaten</legend>
    <label htmlFor='contact-data'>Deine Kontakt-Email-Adresse:</label>
    {user.email}
    <p className='entries-editor-explanation'>
      <Link target='_blank' to={EDIT_USER_ACCOUNT}>
        Kontaktdaten ändern
      </Link>
    </p>
  </fieldset>
)

UserInfo.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string
  }).isRequired
}

export default UserInfo
