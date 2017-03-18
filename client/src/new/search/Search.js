import React from 'react'
import Autocomplete from 'react-autocomplete'
import Select from 'react-select'
import classNames from 'classnames'
import { Link } from 'react-router'
import { getMapPositionPath } from '../AppRouter';
import config from '../configuration'

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

const Search = ({ onSelectCountry, onSelectSearchResult, onAutocomplete, value, items }) => (
  <div className="search">
    <Select
      name="country"
      value={config.country}
      options={[
        { value: 'CH', label: 'CH' },
        { value: 'DE', label: 'DE' },
      ]}
      disabled={false}
      clearable={false}
      searchable={false}
      onChange={v => onSelectCountry(v)}
    />
    <Autocomplete
      inputProps={{
        className: 'search-input',
        placeholder: 'Ort, Hof oder Initiative',
      }}
      renderItem={renderItems}
      renderMenu={renderMenu}
      onChange={(e, v) => onAutocomplete(v)}
      onSelect={v => onSelectSearchResult(v)}
      getItemValue={item => item.value}
      value={value}
      items={items}
    />
  </div>
)

Search.propTypes = {
  onSelectCountry: React.PropTypes.func.isRequired,
  onSelectSearchResult: React.PropTypes.func.isRequired,
  onAutocomplete: React.PropTypes.func.isRequired,
  value: React.PropTypes.string.isRequired,
  items: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
}

export default Search

