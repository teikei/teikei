import { connect } from 'react-redux'
import { sendPlaceMessage } from '../detailsActions'
import ContactTab from './ContactTab'

const mapStateToProps = ({ map }) => ({
  initialValues: { place_id: map.place.id },
})

const mapDispatchToProps = dispatch => ({
  onContactSubmit: payload => dispatch(sendPlaceMessage(payload)),
})

const ContactTabContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ContactTab)

export default ContactTabContainer
