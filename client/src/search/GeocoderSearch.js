import React, { PropTypes } from 'react'
import Autocomplete from 'react-autocomplete'
import classNames from 'classnames'
import isEqual from 'lodash.isequal'
import PreviewTile from '../common/PreviewTile'
import i18n from '../i18n'

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

const formatDisplayValue = ({ address, city }) => {
  if (address && city) {
    return `${address}, ${city}`
  }
  return city || address || ''
}

class GeocoderSearch extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: {},
      initialValue: ''
    }
  }

  componentWillReceiveProps({ geocodePosition, input }) {
    const currentPosition = this.props.geocodePosition

    // Receives new values from geocoder API:
    if (geocodePosition && !isEqual(currentPosition, geocodePosition)) {
      const values = {
        latitude: geocodePosition.lat,
        longitude: geocodePosition.lon,
        city: geocodePosition.city,
        address: geocodePosition.address
      }

      this.setState({
        displayValue: geocodePosition.name,
        values
      })

      input.onChange(values) // Set value for `redux-form`
    }

    // Receives initial input values:
    if (!this.props.input.value && input.value) {
      this.setState({
        displayValue: formatDisplayValue(input.value),
        values: input.value
      })

      input.onChange(input.value) // Set value for `redux-form`
    }
  }

  handleSelect = (event, value) => {
    this.props.onSelect(value.id)
  }

  handleChange = (event, value) => {
    this.setState({ displayValue: value })
    this.props.onAutocomplete(value)
  }

  render() {
    const error = this.props.meta.error
    const value = this.state.values
    const lat = value && value.latitude
    const lon = value && value.longitude

    const wrapperClassNames = classNames({
      'geocoder-search': true,
      'form-input-error': error
    })

    return (
      <div className={wrapperClassNames}>
        <label
          className={classNames({ required: this.props.required })}
          htmlFor={this.props.input.name}
        >
          {this.props.label}
        </label>
        <div className="geocoder-search-input-container">
          <Autocomplete
            inputProps={{
              name: this.props.input.name,
              className: 'geocoder-search-input',
              placeholder: i18n.t('geocoder.placeholder')
            }}
            renderItem={ResultItem}
            renderMenu={ResultMenu}
            onChange={this.handleChange}
            onSelect={this.handleSelect}
            items={this.props.geocoderItems}
            getItemValue={item => item.name}
            value={this.state.displayValue}
          />
          {lat && lon && Preview(lat, lon, this.props.markerIcon)}
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="geocoder-search-info">
          <p>{i18n.t('geocoder.help')}</p>
          <p>{i18n.t('geocoder.explanation')}</p>
        </div>
      </div>
    )
  }
}

GeocoderSearch.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
      address: PropTypes.string.isRequired,
      city: PropTypes.string.isRequired
    })
  }).isRequired,
  meta: PropTypes.shape({
    error: PropTypes.string
  }),
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  markerIcon: PropTypes.oneOf(['Depot', 'Farm', 'Initiative']).isRequired,
  onAutocomplete: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  geocoderItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  geocodePosition: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    address: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired
  })
}

GeocoderSearch.defaultProps = {
  required: false,
  meta: {}
}

export default GeocoderSearch
