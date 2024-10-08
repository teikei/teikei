import React, { useState } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Autocomplete from 'react-autocomplete'
import Select from 'react-select'

import { getDetailsPath, history } from '../../AppRouter'
import { labelOf } from './searchUtils'
import { useGlobalState } from '../../StateContext'
import { useQuery } from '@tanstack/react-query'
import { getAutocompleteSuggestions } from '../../api/places'
import Alert from 'react-s-alert'

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

const Search = ({ countrySelection = true, useHashRouter = true }) => {
  const [autcompleteValue, setAutcompleteValue] = useState('')

  const { country, setCountry } = useGlobalState()

  const autoCompleteQuery = useQuery({
    queryKey: ['autocomplete', autcompleteValue],
    queryFn: () => {
      return autcompleteValue
        ? getAutocompleteSuggestions(autcompleteValue, true)
        : []
    },
    onError: (error) => {
      Alert.error(
        `Suchresultate konnten nicht geladen werden. / ${error.message}`
      )
    }
  })

  const handleSelectCountry = (country) => {
    setCountry(country.value)
  }

  const items = autoCompleteQuery.data || []

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
          setAutcompleteValue(value)
        }}
        onSelect={(v, i) => {
          setAutcompleteValue('')
          if (useHashRouter) {
            history.push(getDetailsPath(i, false))
          } else {
            window.location.assign(getDetailsPath(i))
          }
        }}
        items={items}
        getItemValue={(item) => labelOf(item)}
        value={autcompleteValue}
      />
    </div>
  )
}

Search.propTypes = {
  countrySelection: PropTypes.bool,
  useHashRouter: PropTypes.bool
}

export default Search
