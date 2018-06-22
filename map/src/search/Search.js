import React from 'react'
import PropTypes from 'prop-types'
import Autocomplete from 'react-autocomplete'
import Select from 'react-select'
import classNames from 'classnames'

const renderItems = (item, isHighlighted) => (
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
    {item.name}
  </div>
)

const renderMenu = (items, value, style) => (
  <div className="search-menu" style={{ ...style }}>
    {items}
  </div>
)

class Search extends React.Component {
  constructor(props) {
    super(props)
    this.state = { value: '' }
  }

  render() {
    return (
      <div className="search">
        <Select
          className="search-country-select"
          value={this.props.country}
          options={[{ value: 'CH', label: 'CH' }, { value: 'DE', label: 'DE' }]}
          disabled={false}
          clearable={false}
          searchable={false}
          onChange={this.props.onSelectCountry}
        />
        <Autocomplete
          inputProps={{
            className: 'search-input',
            placeholder: 'Ort, Hof oder Initiative'
          }}
          renderItem={renderItems}
          renderMenu={renderMenu}
          onChange={(event, value) => {
            this.setState({ value })
            this.props.onAutocomplete(value)
          }}
          onSelect={(v, i) => this.props.onSelectSearchResult(i)}
          items={this.props.items}
          getItemValue={item => item.name}
          value={this.state.value}
        />
      </div>
    )
  }
}

Search.propTypes = {
  onSelectCountry: PropTypes.func.isRequired,
  onSelectSearchResult: PropTypes.func.isRequired,
  onAutocomplete: PropTypes.func.isRequired,
  country: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  geocodePosition: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired
  })
}

export default Search
