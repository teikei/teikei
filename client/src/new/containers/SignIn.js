import { connect } from 'react-redux'
import SignIn from '../components/user/SignIn'
import { signIn, signUp } from '../actions/user'

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
