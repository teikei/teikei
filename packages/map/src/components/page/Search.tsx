import { useState } from 'react'
import classNames from 'classnames'
import Autocomplete from 'react-autocomplete'
// @ts-ignore
import Select from 'react-select'
import { useQuery } from '@tanstack/react-query'
import Alert from 'react-s-alert'

import { getDetailsPath, history } from '../../routes'
import { labelOf } from '../../common/searchUtils'
import { useGlobalState } from '../../StateContext'
import { getAutocompleteSuggestions } from '../../queries/places.api'

interface SearchProps {
  countrySelection?: boolean
  useHashRouter?: boolean
}

const renderItems = (item: any, isHighlighted: boolean) => (
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

const renderMenu = (items: any[]) => <div className='search-menu'>{items}</div>

const Search = ({
  countrySelection = true,
  useHashRouter = true
}: SearchProps) => {
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

  const handleSelectCountry = (country: { value: string }) => {
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
          isDisabled={false}
          isClearable={false}
          isSearchable={false}
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

export default Search
