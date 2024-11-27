import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { useCallback, useEffect, useState } from 'react'
import Autocomplete from 'react-autocomplete'
import { useTranslation } from 'react-i18next'
import { WrappedFieldProps } from 'redux-form/lib/Field'
import { addressOf, cityOf, labelOf } from '../../common/searchUtils'
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
    {labelOf(item)}
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
  const [locationId, setLocationId] = useState<string | null>(null)

  useEffect(() => {
    setAutcompleteLabel(
      address.input.value
        ? [address.input.value, city.input.value].join(', ')
        : city.input.value
    )
  }, [address.input.value, city.input.value])

  const autoCompleteQuery = useQuery(
    getAutocompleteSuggestionsQuery(autcompleteValue)
  )

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
    (event: any, value: any) => {
      if (value) {
        setLocationId(value.id)
        setAutcompleteLabel(labelOf(value))
      }
    },
    [setLocationId, setAutcompleteLabel]
  )

  const handleChange = useCallback(
    (event: any, value: string) => {
      setAutcompleteValue(value)
      if (value) {
        setAutcompleteLabel(value)
      } else {
        setAutcompleteLabel('')
        address.input.onChange('')
        city.input.onChange('')
        latitude.input.onChange('')
        longitude.input.onChange('')
        setLocationId(null)
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
  console.log('items', items)

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
          getItemValue={(item) => labelOf(item)}
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
