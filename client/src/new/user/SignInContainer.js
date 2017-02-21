import { connect } from 'react-redux'
import SignIn from './SignIn'
import { signIn, signUp } from './userActions'

const mapStateToProps = ({ user }) => ({
  loggedIn: user.loggedIn,
})

const mapDispatchToProps = dispatch => ({
  onSignInSubmit: payload => dispatch(signIn(payload)),
  onSignUpSubmit: payload => dispatch(signUp(payload)),
})

const SignInContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SignIn)

export default SignInContainer
