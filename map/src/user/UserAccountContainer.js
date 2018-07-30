import { connect } from 'react-redux'
import UserAccount from './UserAccount'
import { updateUser } from './userActions'
import { dirtyValues } from '../common/formUtils'

const mapStateToProps = ({ user }) => ({
  initialValues: user.currentUser
})

const mapDispatchToProps = dispatch => ({
  onSubmit: (payload, dispatch, { initialValues }) =>
    dispatch(updateUser(dirtyValues(payload, initialValues)))
})

const UserAccountContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserAccount)

export default UserAccountContainer
