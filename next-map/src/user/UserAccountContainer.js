import { connect } from 'react-redux'
import UserAccount from './UserAccount'
import { updateUser } from './userActions'

const mapStateToProps = ({ user }) => ({
  initialValues: user.currentUser
})

const mapDispatchToProps = dispatch => ({
  onSubmit: payload => dispatch(updateUser(payload))
})

const UserAccountContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserAccount)

export default UserAccountContainer
