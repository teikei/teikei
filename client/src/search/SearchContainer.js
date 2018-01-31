import { connect } from 'react-redux'
import { autoComplete } from './searchActions'
import { setCountry, showPosition } from '../map/mapActions'
import Search from './Search'

const mapStateToProps = ({ search, map }) => ({
  geocodePosition: search.geocodePosition,
  items: search.items,
  country: map.country
})

const mapDispatchToProps = dispatch => ({
  onSelectCountry: payload => dispatch(setCountry(payload.value)),
  onSelectSearchResult: ({ lat, lon }) => dispatch(showPosition({ lat, lon })),
  onAutocomplete: payload => dispatch(autoComplete(payload))
})

const SearchContainer = connect(mapStateToProps, mapDispatchToProps)(Search)

export default SearchContainer
