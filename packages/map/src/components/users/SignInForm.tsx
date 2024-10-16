import { Link } from 'react-router-dom'
import { Field, reduxForm, InjectedFormProps } from 'redux-form'

import { SIGN_UP, RECOVER_PASSWORD } from '../../routes'
import i18n from '../../i18n'
import InputField from '../base/InputField'

interface SignInFormProps extends InjectedFormProps {}

const SignInForm = ({ handleSubmit, error = '' }: SignInFormProps) => (
  <form onSubmit={handleSubmit}>
    <h2>{i18n.t('user.form.sign_in_title')}</h2>
    <p>
      {i18n.t('user.form.new')}
      <Link to={SIGN_UP}>{i18n.t('user.form.sign_up_link')}</Link>
    </p>

    <div className='form-inputs-big'>
      <strong>{error}</strong>
      <Field
        name='email'
        label={i18n.t('user.form.email')}
        component={InputField}
        type='email'
        maxLength='100'
      />

      <Field
        name='password'
        label={i18n.t('user.form.password')}
        component={InputField}
        type='password'
        maxLength='100'
      />
    </div>

    <div className='form-actions-big'>
      <input
        type='submit'
        className='button'
        value={i18n.t('user.form.submit')}
      />

      <Link to={RECOVER_PASSWORD}>{i18n.t('user.form.forgot_password')}</Link>
    </div>
  </form>
)

const validate = (values: { email?: string; password?: string }) => {
  const errors: { email?: string; password?: string } = {}
  if (!values.email) {
    errors.email = i18n.t('forms.validation.required')
  }
  if (!values.password) {
    errors.password = i18n.t('forms.validation.required')
  }
  return errors
}

export default reduxForm<{}, SignInFormProps>({ form: 'signin', validate })(
  SignInForm
)
