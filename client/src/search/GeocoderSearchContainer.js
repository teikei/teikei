import { connect } from 'react-redux'
import { autoComplete, showShowGeocodePosition } from './searchActions'
import GeocoderSearch from './GeocoderSearch'

const mapStateToProps = ({ search, value }, props) => ({
  geocoderItems: search.items,
  displayValue: search.value,
  geocodePosition: search.geocodePosition,
  ...props
})

const mapDispatchToProps = dispatch => ({
  onAutocomplete: payload => dispatch(autoComplete(payload)),
  onSelect: id => dispatch(showShowGeocodePosition(id))
})

const GeocoderSearchContainer = connect(mapStateToProps, mapDispatchToProps)(
  GeocoderSearch
)

export default GeocoderSearchContainer
