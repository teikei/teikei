import React, { PropTypes } from 'react'
import { Field, reduxForm } from 'redux-form'
import InputField from '../common/InputField'
import i18n from '../i18n'

const UserAccount = ({ handleSubmit, error }) => (
  <div className="details-view open">
    <div className="container">
      <h2>Benutzerkonto anpassen</h2>
      <form className="edit_user" onSubmit={handleSubmit}>
        <div className="form-inputs-big">
          <strong>{ error }</strong>
          <Field
            name="name"
            label={i18n.t('user.form.name')}
            component={InputField}
            type="text"
            maxLength="100"
          />
          <Field
            name="email"
            label={i18n.t('user.form.email')}
            component={InputField}
            type="email"
            maxLength="100"
          />
          <Field
            name="phone"
            label={i18n.t('user.form.phone')}
            component={InputField}
            type="text"
            maxLength="100"
          />
          <Field
            name="password"
            label={i18n.t('user.form.password')}
            component={InputField}
            type="password"
            maxLength="100"
          />
          <p className="form-explanation">
            (Freilassen, wenn das Passwort nicht geändert werden soll)
          </p>
          <Field
            name="password_confirmation"
            label={i18n.t('user.form.password_confirmation')}
            component={InputField}
            type="password"
            maxLength="100"
          />
          <Field
            name="current_password"
            label={'Aktuelles Password'}
            component={InputField}
            type="password"
            maxLength="100"
          />
          <p className="form-explanation">
            (Wir benötigen das aktuelle Passwort, um die Änderung zu bestätigen)
          </p>
        </div>
        <div className="form-actions">
          <input type="submit" className="button submit" value="Speichern" />
        </div>
      </form>
    </div>
  </div>
)

UserAccount.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  error: PropTypes.string,
}

UserAccount.defaultProps = {
  error: '',
}

const validate = (values) => {
  const errors = {}
  if (!values.email) {
    errors.email = i18n.t('forms.validation.required')
  }
  if (!values.current_password) {
    errors.current_password = i18n.t('forms.validation.required')
  }
  return errors
}

export default reduxForm({ form: 'useraccount', validate })(UserAccount)

