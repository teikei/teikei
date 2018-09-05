import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classNames from 'classnames'
import Autocomplete from 'react-autocomplete'
import Select from 'react-select'

import { autoCompleteSearch } from './duck'
import { setCountry } from '../Map/duck'
import { history, getDetailsPath } from '../../AppRouter'
import { labelOf } from './searchUtils'
import { config } from '../../index'

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
    {item.type === 'location' ? labelOf(item) : item.name}
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

  static propTypes = {
    onSelectCountry: PropTypes.func.isRequired,
    onSelectSearchResult: PropTypes.func.isRequired,
    onAutocomplete: PropTypes.func.isRequired,
    country: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    geocodePosition: PropTypes.shape({
      latitude: PropTypes.number.isRequired,
      longitude: PropTypes.number.isRequired
    }),
    countrySelection: PropTypes.bool,
    useHashRouter: PropTypes.bool
  }

  static defaultProps = {
    countrySelection: true,
    useHashRouter: true
  }

  render() {
    const {
      country,
      onAutocomplete,
      onSelectSearchResult,
      onSelectCountry,
      items,
      countrySelection
    } = this.props
    return (
      <div
        className={classNames('search', {
          'search-with-country-select': countrySelection
        })}
      >
        {countrySelection && (
          <Select
            className="search-country-select"
            value={country}
            options={[
              { value: 'CH', label: 'CH' },
              { value: 'DE', label: 'DE' }
            ]}
            disabled={false}
            clearable={false}
            searchable={false}
            onChange={onSelectCountry}
          />
        )}
        <Autocomplete
          inputProps={{
            className: 'search-input',
            placeholder: 'Ort, Hof oder Initiative'
          }}
          renderItem={renderItems}
          renderMenu={renderMenu}
          onChange={(event, value) => {
            this.setState({ value })
            onAutocomplete(value)
          }}
          onSelect={(v, i) => {
            this.setState({ value: '' })
            return onSelectSearchResult(i)
          }}
          items={items}
          getItemValue={item => labelOf(item)}
          value={this.state.value}
        />
      </div>
    )
  }
}

const mapStateToProps = ({ search, map }) => ({
  geocodePosition: search.geocodePosition,
  items: search.items,
  country: map.country
})

const mapDispatchToProps = (dispatch, ownProps) => {
  console.log('ownProps', ownProps)
  return {
    onSelectCountry: payload => dispatch(setCountry(payload.value)),
    onSelectSearchResult: item => {
      const detailsPath = getDetailsPath(item)
      return ownProps.useHashRouter
        ? history.push(detailsPath)
        : window.location.assign(`${config.baseUrl}/${detailsPath}`)
    },
    onAutocomplete: payload => dispatch(autoCompleteSearch(payload, true))
  }
}

const SearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Search)

export default SearchContainer
