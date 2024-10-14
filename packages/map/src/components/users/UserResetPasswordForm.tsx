import { Field, reduxForm, InjectedFormProps } from 'redux-form'

import InputField from '../base/InputField'
import { validator } from '../../common/formUtils'

interface ResetPasswordProps extends InjectedFormProps {}

const ResetPassword = ({ handleSubmit, error = '' }: ResetPasswordProps) => {
  return (
    <div className='user-account'>
      <div className='user-container'>
        <h1>Neues Passwort setzen</h1>
        <form onSubmit={handleSubmit}>
          <div className='form-inputs'>
            <strong>{error}</strong>
            <Field
              name='password'
              label='Neues Password'
              component={InputField}
              type='password'
              maxLength='100'
            />
            <Field
              name='passwordConfirmation'
              label='Password bestätigen'
              component={InputField}
              type='password'
              maxLength='100'
            />
          </div>
          <div className='form-actions'>
            <input
              type='submit'
              className='button submit'
              value='Passwort setzen'
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
