import { connect } from 'react-redux'
import {
  autoCompleteSearch,
  geocodeAndShowOnPreviewTile
} from './searchActions'
import GeocoderSearch from './GeocoderSearch'

const mapStateToProps = ({ search, value }, props) => ({
  geocoderItems: search.items,
  displayValue: search.value,
  geocodePosition: search.geocodePosition,
  ...props
})

const mapDispatchToProps = dispatch => ({
  onAutocomplete: payload => dispatch(autoCompleteSearch(payload)),
  onSelect: id => dispatch(geocodeAndShowOnPreviewTile(id))
})

const GeocoderSearchContainer = connect(mapStateToProps, mapDispatchToProps)(
  GeocoderSearch
)

export default GeocoderSearchContainer
