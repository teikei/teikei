import { connect } from 'react-redux'
import { autoCompleteSearch } from './searchActions'
import { setCountry } from '../map/mapActions'
import Search from './Search'
import { history, getDetailsPath } from '../AppRouter'

const mapStateToProps = ({ search, map }) => ({
  geocodePosition: search.geocodePosition,
  items: search.items,
  country: map.country
})

const mapDispatchToProps = dispatch => ({
  onSelectCountry: payload => dispatch(setCountry(payload.value)),
  onSelectSearchResult: item => history.push(getDetailsPath(item)),
  onAutocomplete: payload => dispatch(autoCompleteSearch(payload))
})

const SearchContainer = connect(mapStateToProps, mapDispatchToProps)(Search)

export default SearchContainer
