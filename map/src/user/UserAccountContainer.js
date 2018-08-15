import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { updateUser } from './userActions'
import { dirtyValues } from '../common/formUtils'
import { Field, reduxForm } from 'redux-form'
import i18n from '../i18n'
import InputField from '../common/InputField'

const UserAccount = ({ handleSubmit, error }) => (
  <div className="user-account">
    <div className="user-container">
      <h1>Benutzerkonto anpassen</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-inputs">
          <strong>{error}</strong>
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
            label="Aktuelles Password"
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
  error: PropTypes.string
}

UserAccount.defaultProps = {
  error: ''
}

const validate = values => {
  const errors = {}
  if (!values.email) {
    errors.email = i18n.t('forms.validation.required')
  }
  if (!values.current_password) {
    errors.current_password = i18n.t('forms.validation.required')
  }
  return errors
}

const mapStateToProps = ({ user }) => ({
  initialValues: user.currentUser
})

const mapDispatchToProps = dispatch => ({
  onSubmit: (payload, dispatch, { initialValues }) =>
    dispatch(updateUser(dirtyValues(payload, initialValues)))
})

const UserAccountContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(reduxForm({ form: 'useraccount', validate })(UserAccount))

export default UserAccountContainer
