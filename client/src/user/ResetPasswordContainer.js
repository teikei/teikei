import { connect } from 'react-redux'
import ResetPassword from './ResetPassword'
import { resetPassword } from './userActions'

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit: payload =>
    dispatch(
      resetPassword({
        ...payload,
        reset_password_token: ownProps.location.query.reset_password_token
      })
    )
})

const ResetPasswordContainer = connect(null, mapDispatchToProps)(ResetPassword)

export default ResetPasswordContainer
