import React from 'react'
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
  input: PropTypes.shape(
    _.omit(fieldInputPropTypes, ['onDragStart', 'onDrop'])
  ),
}

const ResultItem = (item, isHighlighted) => (
  <div
    className={classNames({
      'geocoder-search-item': true,
      'geocoder-search-item-active': isHighlighted,
    })}
    key={item.key}
  >
    {labelOf(item)}
  </div>
)

const ResultMenu = (items) => (
  <div className="geocoder-search-menu">{items}</div>
)

const Preview = (latitude, longitude, markerIcon) => (
  <PreviewTile
    latitude={Number(latitude)}
    longitude={Number(longitude)}
    markerIcon={markerIcon}
  />
)

const initialState = {
  displayValue: '',
  geocodePosition: {},
}

class GeocoderSearch extends React.Component {
  constructor(props) {
    super(props)
    this.state = initialState
  }

  static getDerivedStateFromProps({ geocodePosition }, prevState) {
    if (
      geocodePosition.latitude &&
      !_.isEqual(prevState.geocodePosition, geocodePosition)
    ) {
      return {
        geocodePosition,
        displayValue: labelOf(geocodePosition),
      }
    }
    return null
  }

  componentDidMount() {
    const valueOf = (field) => field.input.value

    const { address, city, latitude, longitude } = this.props

    const addressValue = valueOf(address)
    const cityValue = valueOf(city)

    this.setState({
      displayValue: addressValue
        ? [addressValue, cityValue].join(', ')
        : cityValue,
      geocodePosition: {
        latitude: valueOf(latitude),
        longitude: valueOf(longitude),
        city: valueOf(city),
        street: valueOf(address),
      },
    })
  }

  componentDidUpdate(prevProps, prevState) {
    const { geocodePosition } = this.state
    const { address, city, latitude, longitude } = this.props

    if (
      geocodePosition.latitude &&
      !_.isEqual(prevState.geocodePosition, geocodePosition)
    ) {
      address.input.onChange(addressOf(geocodePosition))
      city.input.onChange(cityOf(geocodePosition))
      latitude.input.onChange(geocodePosition.latitude)
      longitude.input.onChange(geocodePosition.longitude)
    }
  }

  handleSelect = (event, value) => {
    const { onSelect } = this.props

    if (value) {
      onSelect(value.id)
    }
  }

  handleChange = (event, value) => {
    const { onAutocomplete } = this.props

    if (value) {
      this.setState({ displayValue: value })
      onAutocomplete(value)
    } else {
      this.setState(initialState)
    }
  }

  render() {
    const { geocoderItems, address, required, name, label, markerIcon } =
      this.props
    const { geocodePosition, displayValue } = this.state
    const { error, touched } = address.meta
    const { latitude, longitude } = geocodePosition

    const items = geocoderItems.filter(
      ({ type }) => type.toString() === 'location'
    )

    const wrapperClassNames = classNames({
      'geocoder-search': true,
      'form-input-error': error && touched,
    })

    return (
      <div className={wrapperClassNames}>
        <label className={classNames({ required })} htmlFor={name}>
          {label}
        </label>
        <div className="geocoder-search-input-container">
          <Autocomplete
            inputProps={{
              name,
              className: 'geocoder-search-input',
              placeholder: i18n.t('geocoder.placeholder'),
            }}
            renderItem={ResultItem}
            renderMenu={ResultMenu}
            menuStyle={{}}
            onChange={this.handleChange}
            onSelect={this.handleSelect}
            items={items}
            getItemValue={(item) => labelOf(item)}
            value={displayValue}
          />
          {latitude && longitude && Preview(latitude, longitude, markerIcon)}
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
    city: PropTypes.string,
  }),
  required: PropTypes.bool,
  city: PropTypes.shape(fixedFieldPropTypes).isRequired,
  address: PropTypes.shape(fixedFieldPropTypes).isRequired,
  latitude: PropTypes.shape(fixedFieldPropTypes).isRequired,
  longitude: PropTypes.shape(fixedFieldPropTypes).isRequired,
}

GeocoderSearch.defaultProps = {
  required: false,
  geocodePosition: {},
  meta: {},
}

const mapStateToProps = ({ search }, props) => ({
  geocoderItems: search.items,
  geocodePosition: search.geocodePosition,
  ...props,
})

const mapDispatchToProps = (dispatch) => ({
  onAutocomplete: (payload) => dispatch(autoCompleteSearch(payload)),
  onSelect: (id) => dispatch(geocodeAndShowOnPreviewTile(id)),
})

const GeocoderSearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GeocoderSearch)

export default GeocoderSearchContainer
