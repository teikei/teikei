// TODO create error page design and component
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { MAP } from '@/routes'

const ErrorPage = ({ error }) => {
  const { t } = useTranslation()
  return (
    <div className='root'>
      <h2>{t('errors.general_root_error')}</h2>
      <p>{error.toString()}</p>
      <Link to={MAP}>{t('nav.go_back')}</Link>
    </div>
  )
}

export default ErrorPage
