import type { FieldError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface ErrorLabelProps {
  error?: FieldError
}

const ErrorLabel = ({ error }: ErrorLabelProps) => {
  const { t } = useTranslation()

  if (!error?.message) return null

  return <p className='text-sm font-medium text-red-600'>{t(error.message)}</p>
}

export { ErrorLabel }
