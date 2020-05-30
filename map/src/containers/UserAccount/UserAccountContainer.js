import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { Field, reduxForm } from 'redux-form'
import { updateUser } from '../UserOnboarding/duck'
import i18n from '../../i18n'
import InputField from '../../components/InputField/index'
import { validator } from '../../common/formUtils'

const UserAccount = ({ handleSubmit, error }) => (
  <div className="user-account">
    <div className="user-container">
      <h1>Benutzerkonto anpassen</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-inputs">
          <strong>{error}</strong>
          <fieldset>
            <legend>Deine Benutzerdaten</legend>
            {/* TODO implement identityChange with verificaiton email */}
            {/* <p className="form-explanation"> */}
            {/* Bitte beachte, dass Du eine E-Mail zur Bestätigung der neuen */}
            {/* Email-Adresse erhalten wirst, falls du sie hier änderst. */}
            {/* </p> */}
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
          </fieldset>
          <fieldset>
            <legend>Passwort</legend>
            <Field
              name="password"
              label="Aktuelles Passwort"
              component={InputField}
              type="password"
              maxLength="100"
            />
            <p className="form-explanation">
              Wir benötigen das aktuelle Passwort, um die Änderung zu bestätigen
            </p>
          </fieldset>
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

const mapStateToProps = ({ user }) => ({
  initialValues: user.currentUser,
})

// TODO only send dirty values for identityChange
// const mapDispatchToProps = dispatch => ({
//   onSubmit: (payload, dispatch, { initialValues }) =>
//     dispatch(
//       updateUser(
//          _.pick([..._.keys(dirtyValues(payload, initialValues)), 'password'])
//       )
//     )
// })

const mapDispatchToProps = (dispatch) => ({
  onSubmit: (payload, dispatch) => dispatch(updateUser(payload)),
})

const UserAccountContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(
  reduxForm({ form: 'useraccount', validate: validator('changeUserAccount') })(
    UserAccount
  )
)

export default UserAccountContainer
