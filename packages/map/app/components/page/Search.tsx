// @ts-ignore
import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import Autocomplete from 'react-autocomplete'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import { useGlobalState } from '~/lib/StateContext'
import { getAutocompleteSuggestionsQuery } from '~/queries/geo.queries'

import config from '../../config/app-configuration'
import { getDetailsPath } from '../../lib/routeUtils'

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
    {item.title}
  </div>
)

const renderMenu = (items: any[]) => <div className='search-menu'>{items}</div>

const Search = ({ countrySelection = true }: SearchProps) => {
  const { t } = useTranslation()

  const [autocompleteValue, setAutocompleteValue] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('')

  const { country, setCountry } = useGlobalState()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(autocompleteValue)
    }, 300)
    return () => {
      clearTimeout(timer)
    }
  }, [autocompleteValue])

  const autoCompleteQuery = useQuery({
    ...getAutocompleteSuggestionsQuery(
      debouncedValue,
      config.displayLocale,
      true
    ),
    enabled: debouncedValue.length > 1,
    meta: {
      errorMessage: t('errors.search_failed')
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
          onChange={handleSelectCountry}
          // TODO these props do not match the type definitions, bug in react-select?
          disabled={false}
          clearable={false}
          searchable={false}
        />
      )}
      <Autocomplete
        inputProps={{
          className: 'search-input',
          placeholder: t('page.search.input')
        }}
        renderItem={renderItems}
        renderMenu={renderMenu}
        onChange={(_, value) => {
          setAutocompleteValue(value)
        }}
        onSelect={(_, i) => {
          setAutocompleteValue('')
          window.location.assign(getDetailsPath(i, true))
        }}
        items={items}
        getItemValue={(item) => item.title || ''}
        value={autocompleteValue}
      />
    </div>
  )
}

export default Search
