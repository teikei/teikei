import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Autocomplete from 'react-autocomplete'
import { fieldInputPropTypes, fieldPropTypes } from 'redux-form'
import _ from 'lodash'
import classNames from 'classnames'
import { useQuery } from '@tanstack/react-query'

import PreviewTile from '../../components/PreviewTile/index'
import i18n from '../../i18n'
import { addressOf, cityOf, labelOf } from './searchUtils'
import { geocode, getAutocompleteSuggestions } from './query'

// TODO why are onDragStart and onDrop undefined?
const fixedFieldPropTypes = {
  ...fieldPropTypes,
  input: PropTypes.shape(_.omit(fieldInputPropTypes, ['onDragStart', 'onDrop']))
}

const ResultItem = (item, isHighlighted) => (
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

const ResultMenu = (items) => (
  <div className='geocoder-search-menu'>{items}</div>
)

const GeocoderSearch = ({
  label,
  name,
  markerIcon,
  required = false,
  city,
  address,
  latitude,
  longitude
}) => {
  const [autcompleteLabel, setAutcompleteLabel] = useState('')
  const [autcompleteValue, setAutcompleteValue] = useState('')
  const [locationId, setLocationId] = useState(null)

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
      address.input.onChange(addressOf(geocodeResult))
      city.input.onChange(cityOf(geocodeResult))
      latitude.input.onChange(geocodeResult.latitude)
      longitude.input.onChange(geocodeResult.longitude)
      // TODO:
      // houseNumber
      // postalCode
      // state
      // street
      return geocodeResult
    }
  })

  const handleSelect = useCallback(
    (event, value) => {
      if (value) {
        setLocationId(value.id)
        setAutcompleteLabel(labelOf(value))
      }
    },
    [setLocationId, setAutcompleteLabel]
  )

  const handleChange = useCallback(
    (event, value) => {
      setAutcompleteValue(value)
      if (value) {
        setAutcompleteLabel(value)
      } else {
        setAutcompleteLabel(null)
        address.input.onChange(null)
        city.input.onChange(null)
        latitude.input.onChange(null)
        longitude.input.onChange(null)
        setLocationId(null)
      }
    },
    [address.input, city.input, latitude.input, longitude.input]
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

GeocoderSearch.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  markerIcon: PropTypes.oneOf(['Depot', 'Farm', 'Initiative']).isRequired,
  geocodePosition: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
    address: PropTypes.string,
    city: PropTypes.string
  }),
  required: PropTypes.bool,
  city: PropTypes.shape(fixedFieldPropTypes).isRequired,
  address: PropTypes.shape(fixedFieldPropTypes).isRequired,
  latitude: PropTypes.shape(fixedFieldPropTypes).isRequired,
  longitude: PropTypes.shape(fixedFieldPropTypes).isRequired
}

GeocoderSearch.defaultProps = {
  required: false,
  geocodePosition: {},
  meta: {}
}

export default GeocoderSearch
