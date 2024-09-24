import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Autocomplete from 'react-autocomplete'
import { fieldInputPropTypes, fieldPropTypes } from 'redux-form'
import _ from 'lodash'
import classNames from 'classnames'

import { autoCompleteSearch, geocodeAndShowOnPreviewTile } from './duck'
import PreviewTile from '../../components/PreviewTile/index'
import i18n from '../../i18n'
import { addressOf, cityOf, labelOf } from './searchUtils'

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

const Preview = (latitude, longitude, markerIcon) => (
  <PreviewTile
    latitude={Number(latitude)}
    longitude={Number(longitude)}
    markerIcon={markerIcon}
  />
)

const GeocoderSearch = ({
  label,
  name,
  markerIcon,
  onAutocomplete,
  onSelect,
  geocoderItems,
  geocodePosition: initialGeocodePosition,
  required = false,
  city,
  address,
  latitude,
  longitude
}) => {
  const [displayValue, setDisplayValue] = useState('')
  const [geocodePosition, setGeocodePosition] = useState({})

  useEffect(() => {
    const valueOf = (field) => field.input.value

    const addressValue = valueOf(address)
    const cityValue = valueOf(city)

    setDisplayValue(
      addressValue ? [addressValue, cityValue].join(', ') : cityValue
    )
    setGeocodePosition({
      latitude: valueOf(latitude),
      longitude: valueOf(longitude),
      city: valueOf(city),
      street: valueOf(address)
    })
  }, [address, city, latitude, longitude])

  useEffect(() => {
    if (
      initialGeocodePosition.latitude &&
      !_.isEqual(geocodePosition, initialGeocodePosition)
    ) {
      setGeocodePosition(initialGeocodePosition)
      setDisplayValue(labelOf(initialGeocodePosition))
    }

    if (
      geocodePosition.latitude &&
      !_.isEqual(geocodePosition, initialGeocodePosition)
    ) {
      address.input.onChange(addressOf(geocodePosition))
      city.input.onChange(cityOf(geocodePosition))
      latitude.input.onChange(geocodePosition.latitude)
      longitude.input.onChange(geocodePosition.longitude)
    }
  }, [
    geocodePosition,
    address,
    city,
    latitude,
    longitude,
    initialGeocodePosition
  ])

  const handleSelect = useCallback(
    (event, value) => {
      if (value) {
        onSelect(value.id)
      }
    },
    [onSelect]
  )

  const handleChange = useCallback(
    (event, value) => {
      if (value) {
        setDisplayValue(value)
        onAutocomplete(value)
      } else {
        setDisplayValue('')
        setGeocodePosition({})
      }
    },
    [onAutocomplete]
  )

  const items = geocoderItems.filter(
    ({ type }) => type.toString() === 'location'
  )

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
          value={displayValue}
        />
        {geocodePosition.latitude &&
          geocodePosition.longitude &&
          Preview(
            geocodePosition.latitude,
            geocodePosition.longitude,
            markerIcon
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
  onAutocomplete: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  geocoderItems: PropTypes.arrayOf(PropTypes.object).isRequired,
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

const mapStateToProps = ({ search }, props) => ({
  geocoderItems: search.items,
  geocodePosition: search.geocodePosition,
  ...props
})

const mapDispatchToProps = (dispatch) => ({
  onAutocomplete: (payload) => dispatch(autoCompleteSearch(payload)),
  onSelect: (id) => dispatch(geocodeAndShowOnPreviewTile(id))
})

const GeocoderSearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GeocoderSearch)

export default GeocoderSearchContainer
