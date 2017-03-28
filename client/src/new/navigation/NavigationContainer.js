import { connect } from 'react-redux'
import Navigation from './Navigation'
import { signOut } from '../user/userActions'

const mapStateToProps = ({ user }) => ({
  loggedIn: user.loggedIn,
  username: user.loggedIn ? user.currentUser.name : '',
})

const mapDispatchToProps = dispatch => ({
  onSignOutClick: () => dispatch(signOut()),
  onEditClick: () => dispatch(editAccount()),
})

const NavigationContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Navigation)

export default NavigationContainer
