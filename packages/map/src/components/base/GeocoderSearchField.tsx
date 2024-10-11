import { useCallback, useEffect, useState } from 'react'
import Autocomplete from 'react-autocomplete'
import classNames from 'classnames'
import { useQuery } from '@tanstack/react-query'
import { WrappedFieldProps } from 'redux-form/lib/Field'

import PreviewTile from './PreviewTile'
import i18n from '../../i18n'
import { addressOf, cityOf, labelOf } from '../../common/searchUtils'
import { geocode, getAutocompleteSuggestions } from '../../queries/places.api'

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
    key={item.key}
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

  const autoCompleteQuery = useQuery({
    queryKey: ['autocomplete', autcompleteValue],
    queryFn: () => {
      return autcompleteValue
        ? getAutocompleteSuggestions(autcompleteValue)
        : []
    }
  })

  useQuery({
    queryKey: ['geocode', locationId],
    queryFn: async () => {
      if (!locationId) {
        return null
      }
      const geocodeResult = await geocode(locationId)
      try {
        address.input.onChange(addressOf(geocodeResult))
        city.input.onChange(cityOf(geocodeResult))
        latitude.input.onChange(geocodeResult.latitude)
        longitude.input.onChange(geocodeResult.longitude)
      } catch (error) {
        console.error('Error setting geocode result', error)
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
    [setAutcompleteValue, setAutcompleteLabel]
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
            placeholder: i18n.t('geocoder.placeholder')
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
        <p>{i18n.t('geocoder.help')}</p>
        <p>{i18n.t('geocoder.explanation')}</p>
      </div>
    </div>
  )
}

export default GeocoderSearchField
