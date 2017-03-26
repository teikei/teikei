import React from 'react'
import Autocomplete from 'react-autocomplete'
import classNames from 'classnames'
import isEqual from 'lodash.isequal'


const ResultItem = (item, isHighlighted) => (
  <div
    className={classNames({
      'geocoder-search-item': true,
      'geocoder-search-item-active': isHighlighted,
    })}
    key={item.key}
  >
    {item.name}
  </div>
)


const ResultMenu = (items, value) => (
  <div className="geocoder-search-menu">
    {items}
  </div>
)

class GeocoderSearch extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: {},
      initialValue: '',
    }
  }

  componentWillReceiveProps({ input, value }) {
    // TODO: This prevents prefill with input value from redux form
    // How to deal with this?
    if (value !== this.state.displayValue) {
      this.setState({ displayValue: value })
    }

    if (!isEqual(input.value, this.state.value)) {
      this.setState({
        value: {
          latitude: input.value.latitude,
          longitude: input.value.longitude,
          city: input.value.city,
          address: input.value.address,
        },
        displayValue: [
          input.value.address,
          input.value.city,
        ].join(', '),
      })
    }
  }

  handleSelect = (event, value) => {
    const mappedValues = {
      latitude: value.lat,
      longitude: value.lon,
      address: value.address,
      city: value.city,
    }
    this.setState(mappedValues)
    this.props.input.onChange(mappedValues)
  }

  render() {
    return (
      <div className="geocoder-search">
        <label
          className={classNames({ required: this.props.required })}
          htmlFor={this.props.input.name}
        >
          {this.props.label}
        </label>
        <Autocomplete
          inputProps={{
            className: 'geocoder-search-input',
            placeholder: 'Ort, Hof oder Initiative',
            type: 'text',
          }}
          renderItem={ResultItem}
          renderMenu={ResultMenu}
          onChange={(e, v) => this.props.onAutocomplete(v)}
          onSelect={this.handleSelect}
          items={this.props.geocoderItems}
          getItemValue={item => item.name}
          value={this.state.displayValue}
        />
      </div>
    )
  }
}

GeocoderSearch.propTypes = {
  input: React.PropTypes.shape({
    name: React.PropTypes.string,
    onChange: React.PropTypes.func,
    value: React.PropTypes.shape({
      latitude: React.PropTypes.number,
      longitude: React.PropTypes.number,
      city: React.PropTypes.string,
      address: React.PropTypes.string,
    }),
  }).isRequired,
  value: React.PropTypes.string.isRequired,
  label: React.PropTypes.string.isRequired,
  required: React.PropTypes.bool,
  onAutocomplete: React.PropTypes.func.isRequired,
  geocoderItems: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
}

GeocoderSearch.defaultProps = {
  required: false,
}

export default GeocoderSearch
