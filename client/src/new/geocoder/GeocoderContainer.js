import { connect } from 'react-redux'
import { geocode } from './geocoderActions'
import Geocoder from './Geocoder'

const mapStateToProps = ({ geocoder }) => geocoder

const mapDispatchToProps = dispatch => ({
  handleGeocode: payload => dispatch(geocode(payload)),
})

const GeocoderContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Geocoder)

export default GeocoderContainer
