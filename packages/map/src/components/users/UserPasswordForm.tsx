import { Field, reduxForm, InjectedFormProps } from 'redux-form'

import InputField from '../base/InputField'
import { validator } from '../../common/formUtils'

interface UserPasswordFormProps extends InjectedFormProps {}

export interface PasswordChangeFormValues {
  currentPassword: string
  password: string
}

const UserPasswordForm = ({
  handleSubmit,
  error = ''
}: UserPasswordFormProps) => (
  <div className='user-account'>
    <div className='user-container'>
      <h1>Passwort ändern</h1>
      <form onSubmit={handleSubmit}>
        <div className='form-inputs'>
          <strong>{error}</strong>
          <Field
            name='currentPassword'
            label='Aktuelles Passwort'
            component={InputField}
            type='password'
            maxLength='100'
          />
          <Field
            name='password'
            label='Neues Passwort'
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

export default reduxForm<{}, UserPasswordFormProps>({
  form: 'useraccount',
  validate: validator('changePassword')
})(UserPasswordForm)
