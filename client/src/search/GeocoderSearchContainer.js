import { connect } from 'react-redux'
import { autoComplete } from './searchActions'
import GeocoderSearch from './GeocoderSearch'

const mapStateToProps = ({ search, value }, props) => ({
  geocoderItems: search.items,
  displayValue: search.value,
  ...props,
})

const mapDispatchToProps = dispatch => ({
  onAutocomplete: payload => dispatch(autoComplete(payload)),
})

const GeocoderSearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GeocoderSearch)

export default GeocoderSearchContainer
