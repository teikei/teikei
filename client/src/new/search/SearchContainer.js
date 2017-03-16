import { connect } from 'react-redux'
import { selectCountry, selectSearchResult, autoCompleteSearch } from './searchActions'
import Search from './Search'


const mapStateToProps = ({ search }) => ({
  items: search.items,
  value: search.value,
})

const mapDispatchToProps = dispatch => ({
  onSelectCountry: payload => dispatch(selectCountry(payload)),
  onSelectSearchResult: payload => dispatch(selectSearchResult(payload)),
  onAutocomplete: payload => dispatch(autoCompleteSearch(payload)),
})

const SearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Search)

export default SearchContainer
