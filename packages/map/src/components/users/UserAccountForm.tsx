import { Field, reduxForm, InjectedFormProps } from 'redux-form'
import { useTranslation } from 'react-i18next'

import InputField from '../base/InputField'
import { validator } from '../../common/formUtils'

interface UserAccountFormProps extends InjectedFormProps {}

const UserAccountForm = ({ handleSubmit, error }: UserAccountFormProps) => {
  const { t } = useTranslation()

  return (
    <div className='user-account'>
      <div className='user-container'>
        <h1>{t('users.account.edit_account_data')}</h1>
        <form onSubmit={handleSubmit}>
          <div className='form-inputs'>
            <strong>{error}</strong>
            <fieldset>
              <legend>{t('users.account.your_user_data')}</legend>
              <Field
                name='name'
                label={t('user.form.name')}
                component={InputField}
                type='text'
                maxLength='100'
              />
              <Field
                name='email'
                label={t('user.form.email')}
                component={InputField}
                type='email'
                maxLength='100'
              />
              <Field
                name='phone'
                label={t('user.form.phone')}
                component={InputField}
                type='text'
                maxLength='100'
              />
            </fieldset>
            <fieldset>
              <legend>{t('users.account.password')}</legend>
              <Field
                name='password'
                label={t('users.account.current_password_label')}
                component={InputField}
                type='password'
                maxLength='100'
              />
              <p className='form-explanation'>
                {t('users.account.current_password')}
              </p>
            </fieldset>
          </div>
          <div className='form-actions'>
            <input
              type='submit'
              className='button submit'
              value={t('users.account.submit')}
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default reduxForm<{}, UserAccountFormProps>({
  form: 'useraccount',
  validate: validator('changeUserAccount')
})(UserAccountForm)
