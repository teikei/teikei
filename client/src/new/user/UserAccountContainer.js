import { connect } from 'react-redux'
import UserAccount from './UserAccount'

const mapStateToProps = ({ user }) => ({
  user: user.currentUser,
})

const mapDispatchToProps = () => ({
})

const UserAccountContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserAccount)

export default UserAccountContainer
