import { connect } from 'react-redux'
import { autoComplete } from './searchActions'
import { setCountry, showPosition } from '../map/mapActions'
import Search from './Search'


const mapStateToProps = ({ search, map }) => ({
  items: search.items,
  value: search.value,
  country: map.country,
})

const mapDispatchToProps = dispatch => ({
  onSelectCountry: payload => dispatch(setCountry(payload)),
  onSelectSearchResult: payload => dispatch(showPosition(payload)),
  onAutocomplete: payload => dispatch(autoComplete(payload)),
})

const SearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Search)

export default SearchContainer
