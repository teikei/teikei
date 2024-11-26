import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { EDIT_USER_ACCOUNT } from '../../routes'
import { User } from '../../types/types'

interface UserInfoProps {
  user: User
}

const UserInfo = ({ user }: UserInfoProps) => {
  const { t } = useTranslation()
  return (
    <fieldset className='entries-editor-user-info'>
      <legend>{t('places.userinfo.contact_data')}</legend>
      <label htmlFor='contact-data'>{t('places.userinfo.email')}</label>
      {user.email}
      <p className='entries-editor-explanation'>
        <Link target='_blank' to={EDIT_USER_ACCOUNT}>
          {t('places.userinfo.edit_contact_data')}
        </Link>
      </p>
    </fieldset>
  )
}

export default UserInfo
