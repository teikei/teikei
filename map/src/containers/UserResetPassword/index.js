import React from 'react'
import PropTypes from 'prop-types'
import { Field, reduxForm } from 'redux-form'
import { connect } from 'react-redux'

import { resetPassword } from '../UserOnboarding/duck'
import InputField from '../../components/InputField/index'
import { validator } from '../../common/formUtils'

const ResetPassword = ({ handleSubmit, error }) => (
  <div className="user-account">
    <div className="user-container">
      <h1>Neues Passwort setzen</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-inputs">
          <strong>{error}</strong>
          <Field
            name="password"
            label="Neues Password"
            component={InputField}
            type="password"
            maxLength="100"
          />
          <Field
            name="passwordConfirmation"
            label="Password bestätigen"
            component={InputField}
            type="password"
            maxLength="100"
          />
        </div>
        <div className="form-actions">
          <input
            type="submit"
            className="button submit"
            value="Passwort setzen"
          />
        </div>
      </form>
    </div>
  </div>
)

ResetPassword.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  error: PropTypes.string
}

ResetPassword.defaultProps = {
  error: ''
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit: payload =>
    dispatch(
      resetPassword({
        ...payload,
        reset_password_token: ownProps.location.query.reset_password_token
      })
    )
})

const ResetPasswordContainer = connect(
  null,
  mapDispatchToProps
)(
  reduxForm({ form: 'resetPassword', validate: validator('resetPassword') })(
    ResetPassword
  )
)

export default ResetPasswordContainer
