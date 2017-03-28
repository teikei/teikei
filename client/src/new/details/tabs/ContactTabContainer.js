import { connect } from 'react-redux'
import { sendPlaceMessage } from '../detailsActions'
import ContactTab from './ContactTab'

const mapStateToProps = ({ details }) => {debugger; return ({
  initialValues: { place_id: details.place.id },
})
}

const mapDispatchToProps = dispatch => ({
  onContactSubmit: payload => dispatch(sendPlaceMessage(payload)),
})

const ContactTabContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ContactTab)

export default ContactTabContainer
