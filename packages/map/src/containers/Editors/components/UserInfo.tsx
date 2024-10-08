import { Link } from 'react-router-dom'
import { EDIT_USER_ACCOUNT } from '../../../AppRouter'

interface UserInfoProps {
  user: {
    name: string
    email: string
    phone: string
  }
}

const UserInfo = ({ user }: UserInfoProps) => (
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

export default UserInfo
