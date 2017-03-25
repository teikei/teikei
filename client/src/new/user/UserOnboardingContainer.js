import { connect } from 'react-redux'
import SignIn from './UserOnboarding'
import { signIn, signUp } from './userActions'

const mapStateToProps = ({ user }, { route }) => ({
  loggedIn: user.loggedIn,
  signUp: route.signUp,
})

const mapDispatchToProps = dispatch => ({
  onSignInSubmit: payload => dispatch(signIn(payload)),
  onSignUpSubmit: payload => dispatch(signUp(payload)),
})

const UserOnboardingContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SignIn)

export default UserOnboardingContainer
