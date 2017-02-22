import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import Navigation from './Navigation'
import { signOut, editAccount } from '../user/userActions'

const mapStateToProps = ({ user }) => ({
  loggedIn: user.loggedIn,
  username: user.loggedIn ? user.currentUser.name : '',
})

const mapDispatchToProps = dispatch => ({
  onSignInClick: () => browserHistory.push('/new/users/sign_in'),
  onSignOutClick: () => dispatch(signOut()),
  onEditClick: () => dispatch(editAccount()),
})

const NavigationContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Navigation)

export default NavigationContainer
