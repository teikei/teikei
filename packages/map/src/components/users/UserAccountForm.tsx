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
        <h1>Benutzerkonto anpassen</h1>
        <form onSubmit={handleSubmit}>
          <div className='form-inputs'>
            <strong>{error}</strong>
            <fieldset>
              <legend>Deine Benutzerdaten</legend>
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
              <legend>Passwort</legend>
              <Field
                name='password'
                label='Aktuelles Passwort'
                component={InputField}
                type='password'
                maxLength='100'
              />
              <p className='form-explanation'>
                Wir benötigen das aktuelle Passwort, um die Änderung zu
                bestätigen
              </p>
            </fieldset>
          </div>
          <div className='form-actions'>
            <input type='submit' className='button submit' value='Speichern' />
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
