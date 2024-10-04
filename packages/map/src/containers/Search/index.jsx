import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import Autocomplete from 'react-autocomplete'
import Select from 'react-select'

import { autoCompleteSearch } from './duck'
import { getDetailsPath, history } from '../../AppRouter'
import { labelOf } from './searchUtils'
import { useGlobalState } from '../../StateContext'

const renderItems = (item, isHighlighted) => (
  <div
    className={classNames({
      'search-result': true,
      'search-result-farm': item.type === 'farm',
      'search-result-depot': item.type === 'depot',
      'search-result-initiative': item.type === 'initiative',
      'search-result-location': item.type === 'location',
      'search-result-active': isHighlighted
    })}
    key={item.key}
  >
    {item.type === 'location' ? labelOf(item) : item.name}
  </div>
)

const renderMenu = (items) => <div className='search-menu'>{items}</div>

const Search = ({
  onAutocomplete,
  items,
  countrySelection = true,
  useHashRouter = true
}) => {
  const [value, setValue] = useState('')

  const { country, setCountry } = useGlobalState()

  const handleSelectCountry = (country) => {
    setCountry(country.value)
  }

  return (
    <div
      className={classNames('search', {
        'search-with-country-select': countrySelection
      })}
    >
      {countrySelection && (
        <Select
          className='search-country-select'
          value={country}
          options={[
            { value: 'AT', label: 'AT' },
            { value: 'CH', label: 'CH' },
            { value: 'DE', label: 'DE' }
          ]}
          disabled={false}
          clearable={false}
          searchable={false}
          onChange={handleSelectCountry}
        />
      )}
      <Autocomplete
        inputProps={{
          className: 'search-input',
          placeholder: 'Ort, Hof oder Initiative'
        }}
        renderItem={renderItems}
        renderMenu={renderMenu}
        onChange={(event, value) => {
          setValue(value)
          onAutocomplete(value)
        }}
        onSelect={(v, i) => {
          setValue('')
          if (useHashRouter) {
            history.push(getDetailsPath(i, false))
          } else {
            window.location.assign(getDetailsPath(i))
          }
        }}
        items={items}
        getItemValue={(item) => labelOf(item)}
        value={value}
      />
    </div>
  )
}

Search.propTypes = {
  onAutocomplete: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  geocodePosition: PropTypes.shape({
    latitude: PropTypes.number, // TODO BUG .isRequired,
    longitude: PropTypes.number // TODO BUG .isRequired,
  }),
  countrySelection: PropTypes.bool,
  useHashRouter: PropTypes.bool
}

const mapStateToProps = ({ search, map }) => ({
  geocodePosition: search.geocodePosition,
  items: search.items
})

const mapDispatchToProps = (dispatch) => ({
  onAutocomplete: (payload) => dispatch(autoCompleteSearch(payload, true))
})

const SearchContainer = connect(mapStateToProps, mapDispatchToProps)(Search)

export default SearchContainer
