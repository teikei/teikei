import { useTranslation } from 'react-i18next'
import { Field, reduxForm } from 'redux-form'
import type { InjectedFormProps } from 'redux-form'

import { validator } from '~/common/formUtils'
import InputField from '~/components/base/InputField'

interface ResetPasswordProps extends InjectedFormProps {}

const ResetPassword = ({ handleSubmit, error = '' }: ResetPasswordProps) => {
  const { t } = useTranslation()
  return (
    <div className='user-account'>
      <div className='user-container'>
        <h1>{t('users.forms.reset_password_title')}</h1>
        <form onSubmit={handleSubmit}>
          <div className='form-inputs'>
            <strong>{error}</strong>
            <Field
              name='password'
              label={t('users.forms.new_password')}
              component={InputField}
              type='password'
              maxLength='100'
            />
            <Field
              name='passwordConfirmation'
              label={t('users.forms.confirm_password')}
              component={InputField}
              type='password'
              maxLength='100'
            />
          </div>
          <div className='form-actions'>
            <input
              type='submit'
              className='button submit'
              value={t('users.forms.submit')}
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default reduxForm<{}, ResetPasswordProps>({
  form: 'resetPassword',
  validate: validator('resetPassword')
})(ResetPassword)
