import React, { PropTypes } from 'react'
import Autocomplete from 'react-autocomplete'
import Select from 'react-select'
import classNames from 'classnames'
import { Link } from 'react-router'
import { getMapPositionPath } from '../AppRouter'

const renderItems = (item, isHighlighted) => (
  <Link
    className={classNames({
      'search-result': true,
      'search-result-farm': item.type === 'farm',
      'search-result-depot': item.type === 'depot',
      'search-result-location': item.type === 'location',
      'search-result-active': isHighlighted,
    })}
    key={item.key}
    to={getMapPositionPath(item)}
  >
    {item.name}
  </Link>
)

const renderMenu = (items, value, style) => (
  <div className="search-menu" style={{ ...style }}>
    {items}
  </div>
)

const Search = props => (
  <div className="search">
    <Select
      className="search-country-select"
      name="country"
      value={props.country}
      options={[
        { value: 'CH', label: 'CH' },
        { value: 'DE', label: 'DE' },
      ]}
      disabled={false}
      clearable={false}
      searchable={false}
      onChange={props.onSelectCountry}
    />
    <Autocomplete
      inputProps={{
        className: 'search-input',
        placeholder: 'Ort, Hof oder Initiative',
      }}
      renderItem={renderItems}
      renderMenu={renderMenu}
      onChange={(e, v) => props.onAutocomplete(v)}
      onSelect={(v, i) => props.onSelectSearchResult(i)}
      items={props.items}
      getItemValue={item => item.name}
      value={props.value}
    />
  </div>
)

Search.propTypes = {
  onSelectCountry: PropTypes.func.isRequired,
  onSelectSearchResult: PropTypes.func.isRequired,
  onAutocomplete: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  country: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default Search

