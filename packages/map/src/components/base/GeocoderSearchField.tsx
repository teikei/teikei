import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import Autocomplete from 'react-autocomplete'
import { useTranslation } from 'react-i18next'
import { WrappedFieldProps } from 'redux-form/lib/Field'
import { addressOf, cityOf } from '../../common/searchUtils'
import config from '../../configuration.ts'
import {
  geocodeLocationIdQuery,
  getAutocompleteSuggestionsQuery
} from '../../queries/geo.queries.ts'
import PreviewTile from './PreviewTile'

interface GeocoderSearchFieldProps {
  label: string
  name: string
  markerIcon: 'Depot' | 'Farm' | 'Initiative'
  required?: boolean
  city: WrappedFieldProps
  address: WrappedFieldProps
  latitude: WrappedFieldProps
  longitude: WrappedFieldProps
}

const ResultItem = (item: any, isHighlighted: boolean) => (
  <div
    className={classNames({
      'geocoder-search-item': true,
      'geocoder-search-item-active': isHighlighted
    })}
    key={item.id}
  >
    {item.title}
  </div>
)

const ResultMenu = (items: any[]) => (
  <div className='geocoder-search-menu'>{items}</div>
)

const GeocoderSearchField = ({
  label,
  name,
  markerIcon,
  required = false,
  city,
  address,
  latitude,
  longitude
}: GeocoderSearchFieldProps) => {
  const { t } = useTranslation()

  const [autcompleteLabel, setAutcompleteLabel] = useState('')
  const [autcompleteValue, setAutcompleteValue] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('')
  const [locationId, setLocationId] = useState<string | undefined>(undefined)

  useEffect(() => {
    setAutcompleteLabel(
      address.input.value
        ? [address.input.value, city.input.value].join(', ')
        : city.input.value
    )
  }, [address.input.value, city.input.value])

  // Debounce the autocomplete value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(autcompleteValue)
    }, 300)
    return () => {
      clearTimeout(timer)
    }
  }, [autcompleteValue])

  const autoCompleteQuery = useQuery({
    ...getAutocompleteSuggestionsQuery(debouncedValue, config.displayLocale),
    enabled: debouncedValue.length > 1
  })

  useQuery({
    ...geocodeLocationIdQuery(locationId),
    queryFn: async () => {
      const queryFn = geocodeLocationIdQuery(locationId).queryFn
      const geocodeResult = await queryFn()
      if (geocodeResult) {
        address.input.onChange(addressOf(geocodeResult))
        city.input.onChange(cityOf(geocodeResult))
        latitude.input.onChange(geocodeResult.latitude)
        longitude.input.onChange(geocodeResult.longitude)
      }
      return geocodeResult
    }
  })

  const handleSelect = useCallback(
    (_event: string, item: any) => {
      if (item) {
        setLocationId(item.id)
        setAutcompleteLabel(item.title || '')
      }
    },
    [setLocationId, setAutcompleteLabel]
  )

  const handleChange = useCallback(
    (_event: ChangeEvent<HTMLInputElement>, value: string) => {
      setAutcompleteValue(value)
      if (value) {
        setAutcompleteLabel(value)
      } else {
        setAutcompleteLabel('')
        address.input.onChange('')
        city.input.onChange('')
        latitude.input.onChange('')
        longitude.input.onChange('')
        setLocationId(undefined)
      }
    },
    [
      setAutcompleteValue,
      setAutcompleteLabel,
      address.input,
      city.input,
      latitude.input,
      longitude.input
    ]
  )

  const items = autoCompleteQuery?.data || []

  const wrapperClassNames = classNames({
    'geocoder-search': true,
    'form-input-error': address.meta.error && address.meta.touched
  })

  return (
    <div className={wrapperClassNames}>
      <label className={classNames({ required })} htmlFor={name}>
        {label}
      </label>
      <div className='geocoder-search-input-container'>
        <Autocomplete
          inputProps={{
            name,
            className: 'geocoder-search-input',
            placeholder: t('geocoder.placeholder')
          }}
          renderItem={ResultItem}
          renderMenu={ResultMenu}
          menuStyle={{}}
          onChange={handleChange}
          onSelect={handleSelect}
          items={items}
          getItemValue={(item) => item.title}
          value={autcompleteLabel}
        />
        {latitude.input.value && longitude.input.value && (
          <PreviewTile
            latitude={latitude.input.value}
            longitude={longitude.input.value}
            markerIcon={markerIcon}
          />
        )}
      </div>
      {address.meta.touched && address.meta.error && (
        <p className='form-error'>{address.meta.error}</p>
      )}
      <div className='geocoder-search-info'>
        <p>{t('geocoder.help')}</p>
        <p>{t('geocoder.explanation')}</p>
      </div>
    </div>
  )
}

export default GeocoderSearchField
