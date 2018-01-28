import { connect } from 'react-redux'
import RecoverPassword from './RecoverPassword'
import { recoverPassword } from './userActions'

const mapDispatchToProps = dispatch => ({
  onSubmit: payload => dispatch(recoverPassword(payload))
})

const RecoverPasswordContainer = connect(null, mapDispatchToProps)(
  RecoverPassword
)

export default RecoverPasswordContainer
