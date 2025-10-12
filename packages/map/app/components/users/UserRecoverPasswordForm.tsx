import { useTranslation } from 'react-i18next'
import { Field, reduxForm } from 'redux-form'
import type { InjectedFormProps } from 'redux-form'

import { validator } from '~/common/formUtils'
import InputField from '~/components/base/InputField'

interface UserRecoverPasswordFormProps extends InjectedFormProps {}

const UserRecoverPasswordForm = ({
  handleSubmit,
  error = ''
}: UserRecoverPasswordFormProps) => {
  const { t } = useTranslation()

  return (
    <div className='user-account'>
      <div className='user-container'>
        <h1>{t('user.form.forgot_password')}</h1>
        <form onSubmit={handleSubmit}>
          <div className='form-inputs'>
            <strong>{error}</strong>
            <Field
              name='email'
              label={t('user.form.email')}
              component={InputField}
              type='email'
              maxLength='100'
            />
            <p className='form-explanation'>
              {t('user.form.password_explanation')}
            </p>
          </div>
          <div className='form-actions'>
            <input
              type='submit'
              className='button submit'
              value={t('user.form.reset_password')}
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default reduxForm<{}, UserRecoverPasswordFormProps>({
  form: 'recoverPassword',
  validate: validator('recoverPassword')
})(UserRecoverPasswordForm)
