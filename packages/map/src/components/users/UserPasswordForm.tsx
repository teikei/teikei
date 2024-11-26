import { useTranslation } from 'react-i18next'
import { Field, InjectedFormProps, reduxForm } from 'redux-form'
import { validator } from '../../common/formUtils'
import { UpdateUserPasswordParams } from '../../queries/users.api.ts'
import InputField from '../base/InputField'

interface UserPasswordFormProps extends InjectedFormProps {}

export type UserPasswordFormValues = Omit<UpdateUserPasswordParams, 'email'>

const UserPasswordForm = ({
  handleSubmit,
  error = ''
}: UserPasswordFormProps) => {
  const { t } = useTranslation()
  return (
    <div className='user-account'>
      <div className='user-container'>
        <h1>{t('users.password.change_password_title')}</h1>
        <form onSubmit={handleSubmit}>
          <div className='form-inputs'>
            <strong>{error}</strong>
            <Field
              name='oldPassword'
              label={t('users.password.current')}
              component={InputField}
              type='password'
              maxLength='100'
            />
            <Field
              name='password'
              label={t('users.password.new')}
              component={InputField}
              type='password'
              maxLength='100'
            />
          </div>
          <div className='form-actions'>
            <input type='submit' className='button submit' value='Speichern' />
          </div>
        </form>
      </div>
    </div>
  )
}

export default reduxForm<{}, UserPasswordFormProps>({
  form: 'useraccount',
  validate: validator('changePassword')
})(UserPasswordForm)
