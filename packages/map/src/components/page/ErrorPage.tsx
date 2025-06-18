// TODO create error page design and component
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { MAP } from '../../routes'

const ErrorPage = ({ error }) => {
  const { t } = useTranslation()
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8 text-center'>
        <h2 className='text-2xl font-bold text-gray-900'>
          {t('errors.general_root_error')}
        </h2>
        <p className='text-gray-600'>{error.toString()}</p>
        <Link
          to={MAP}
          className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
        >
          {t('nav.go_back')}
        </Link>
      </div>
    </div>
  )
}

export default ErrorPage
