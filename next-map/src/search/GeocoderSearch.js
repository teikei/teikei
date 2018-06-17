import React from 'react'
import PropTypes from 'prop-types'
import { fieldPropTypes, fieldInputPropTypes } from 'redux-form'
import Autocomplete from 'react-autocomplete'
import classNames from 'classnames'
import _ from 'lodash'

import PreviewTile from '../common/PreviewTile'
import i18n from '../i18n'

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
    {item.name}
  </div>
)

const ResultMenu = items => <div className="geocoder-search-menu">{items}</div>

const Preview = (latitude, longitude, markerIcon) => (
  <PreviewTile
    latitude={Number(latitude)}
    longitude={Number(longitude)}
    markerIcon={markerIcon}
  />
)

const initialState = {
  displayValue: '',
  values: {}
}

class GeocoderSearch extends React.Component {
  constructor(props) {
    super(props)
    this.state = initialState
  }

  componentWillReceiveProps({ geocodePosition }) {
    const currentPosition = this.props.geocodePosition
    const { lat, lon, city, address, name } = geocodePosition

    if (geocodePosition && !_.isEqual(currentPosition, geocodePosition)) {
      this.setState({
        displayValue: name,
        values: geocodePosition
      })
      this.props.city.input.onChange(city)
      this.props.address.input.onChange(address)
      this.props.latitude.input.onChange(lat)
      this.props.longitude.input.onChange(lon)
    }
  }

  handleSelect = (event, value) => {
    if (value) {
      this.props.onSelect(value.id)
    }
  }

  handleChange = (event, value) => {
    if (value) {
      this.setState({ displayValue: value })
      this.props.onAutocomplete(value)
    } else {
      this.setState(initialState)
    }
  }

  render() {
    const { error, touched } = this.props.address.meta
    const { lat, lon } = this.state.values
    const items = this.props.geocoderItems.filter(
      ({ type }) => type === 'location'
    )

    const wrapperClassNames = classNames({
      'geocoder-search': true,
      'form-input-error': error && touched
    })

    return (
      <div className={wrapperClassNames}>
        <label
          className={classNames({ required: this.props.required })}
          htmlFor={this.props.name}
        >
          {this.props.label}
        </label>
        <div className="geocoder-search-input-container">
          <Autocomplete
            inputProps={{
              name: this.props.name,
              className: 'geocoder-search-input',
              placeholder: i18n.t('geocoder.placeholder')
            }}
            renderItem={ResultItem}
            renderMenu={ResultMenu}
            onChange={this.handleChange}
            onSelect={this.handleSelect}
            items={items}
            getItemValue={item => item.name}
            value={this.state.displayValue}
          />
          {lat && lon && Preview(lat, lon, this.props.markerIcon)}
        </div>
        {touched && error && <p className="form-error">{error}</p>}
        <div className="geocoder-search-info">
          <p>{i18n.t('geocoder.help')}</p>
          <p>{i18n.t('geocoder.explanation')}</p>
        </div>
      </div>
    )
  }
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

export default GeocoderSearch
