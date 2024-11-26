import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Field, InjectedFormProps, reduxForm } from 'redux-form'

import { validator } from '../../common/formUtils'
import { MAP, SIGN_IN } from '../../routes'
import InputField from '../base/InputField'

interface SignUpFormProps extends InjectedFormProps {
  signUpSuccess: boolean
}

const SignUpForm = ({
  handleSubmit,
  signUpSuccess,
  error = ''
}: SignUpFormProps) => {
  const { t } = useTranslation()

  if (signUpSuccess) {
    return (
      <form className='form-inputs' onSubmit={handleSubmit}>
        <strong>
          <p>{t('users.signup.success_title')}</p>
          <p>{t('users.signup.success_text')}</p>
        </strong>
        <Link to={MAP}>{t('users.signup.back_to_map')}</Link>
      </form>
    )
  }
  return (
    <form onSubmit={handleSubmit}>
      <h2>{t('user.form.sign_up_title')}</h2>

      <p>
        {t('user.form.existing')}
        <Link to={SIGN_IN}>{t('user.form.sign_in_link')}</Link>
      </p>

      <div className='form-inputs-big'>
        <strong>{error}</strong>
        <Field
          name='name'
          label={t('user.form.name')}
          component={InputField}
          type='text'
          maxLength='100'
        />

        <Field
          name='phone'
          label={t('user.form.phone')}
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
          name='password'
          label={t('user.form.password')}
          component={InputField}
          type='password'
          maxLength='100'
        />

        <Field
          name='passwordConfirmation'
          label={t('user.form.password_confirmation')}
          component={InputField}
          type='password'
          maxLength='100'
        />
      </div>

      <p>
        {t('user.form.confirmation')}
        <a
          href='https://ernte-teilen.org/nutzungsbedingungen'
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('user.form.terms')}
        </a>
        /
        <a
          href='https://ernte-teilen.org/datenschutz'
          target='_blank'
          rel='noopener noreferrer'
        >
          {t('user.form.privacy')}
        </a>
      </p>

      <div className='form-actions-big'>
        <input type='submit' className='button' value={t('user.form.submit')} />
      </div>
    </form>
  )
}

export default reduxForm<{}, SignUpFormProps>({
  form: 'signup',
  validate: validator('signUp')
})(SignUpForm)
