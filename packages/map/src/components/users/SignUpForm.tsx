import { Link } from 'react-router-dom'
import { Field, reduxForm, InjectedFormProps } from 'redux-form'

import { MAP, SIGN_IN } from '../../routes'
import i18n from '../../i18n'
import InputField from '../base/InputField'
import { validator } from '../../common/formUtils'

interface SignUpFormProps extends InjectedFormProps {
  signUpSuccess: boolean
}

const SignUpForm = ({
  handleSubmit,
  signUpSuccess,
  error = ''
}: SignUpFormProps) => {
  if (signUpSuccess) {
    return (
      <form className='form-inputs' onSubmit={handleSubmit}>
        <strong>
          <p>Du wurdest erfolgreich registriert!</p>
          <p>
            Wir haben Dir eine Bestätigungsemail geschickt, mit der du Deine
            Registrierung abschließen kannst.
          </p>
        </strong>
        <Link to={MAP}>zurück zur Karte</Link>
      </form>
    )
  }
  return (
    <form onSubmit={handleSubmit}>
      <h2>{i18n.t('user.form.sign_up_title')}</h2>

      <p>
        {i18n.t('user.form.existing')}
        <Link to={SIGN_IN}>{i18n.t('user.form.sign_in_link')}</Link>
      </p>

      <div className='form-inputs-big'>
        <strong>{error}</strong>
        <Field
          name='name'
          label={i18n.t('user.form.name')}
          component={InputField}
          type='text'
          maxLength='100'
        />

        <Field
          name='phone'
          label={i18n.t('user.form.phone')}
          component={InputField}
          type='text'
          maxLength='100'
        />

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

        <Field
          name='passwordConfirmation'
          label={i18n.t('user.form.password_confirmation')}
          component={InputField}
          type='password'
          maxLength='100'
        />
      </div>

      <p>
        {i18n.t('user.form.confirmation')}
        <a
          href='https://ernte-teilen.org/nutzungsbedingungen'
          target='_blank'
          rel='noopener noreferrer'
        >
          {i18n.t('user.form.terms')}
        </a>
        /
        <a
          href='https://ernte-teilen.org/datenschutz'
          target='_blank'
          rel='noopener noreferrer'
        >
          {i18n.t('user.form.privacy')}
        </a>
      </p>

      <div className='form-actions-big'>
        <input
          type='submit'
          className='button'
          value={i18n.t('user.form.submit')}
        />
      </div>
    </form>
  )
}

export default reduxForm<{}, SignUpFormProps>({
  form: 'signup',
  validate: validator('signUp')
})(SignUpForm)
