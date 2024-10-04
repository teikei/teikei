import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Field, reduxForm } from 'redux-form'
import { connect } from 'react-redux'

import { resetPassword } from '../UserOnboarding/duck'
import InputField from '../../components/InputField/index'
import { validator } from '../../common/formUtils'
import { history, MAP, useQuery } from '../../AppRouter'
import { withRouter } from 'react-router'

const ResetPassword = ({ handleSubmit, error }) => {
  const query = useQuery()
  useEffect(() => {
    // reject routing request if no reset token is present
    if (!query.has('reset_password_token')) {
      history.push(MAP)
    }
  }, [])
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

ResetPassword.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  error: PropTypes.string
}

ResetPassword.defaultProps = {
  error: ''
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit(payload) {
    const query = new URLSearchParams(ownProps.location.search)
    return dispatch(
      resetPassword({
        ...payload,
        reset_password_token: query.get('reset_password_token')
      })
    )
  }
})

const ResetPasswordContainer = connect(
  null,
  mapDispatchToProps
)(
  reduxForm({ form: 'resetPassword', validate: validator('resetPassword') })(
    ResetPassword
  )
)

export default withRouter(ResetPasswordContainer)
