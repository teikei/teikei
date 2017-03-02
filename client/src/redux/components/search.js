import React from 'react'
import request from 'superagent'
import Autocomplete from 'react-autocomplete'
import classNames from 'classnames'
import conf from '../../configuration'

export default class Search extends React.Component {

  static propTypes = {
    defaultValue: React.PropTypes.string.isRequired,
  }

  state = {
    locations: [],
    loading: false,
    value: '',
  }

  getItemValue = item => item.name

  handleSelect = (value, item) => {
    this.setState({ value })
    Places.mapView.centerTo(item.lat, item.lon)
  }

  handleChange = (event, value) => {
    this.setState({ value, loading: true })
    let locations = []
    request
      .get('/api/v1/geocode/autocomplete/combined')
      .query({
        text: value,
        layers: 'address,street,locality,neighbourhood',
        'boundary.country': conf.boundary.country,
      })
      .end((err, res) => {
        if (err) {
          this.setState({ loading: false })
        } else {
          locations = locations.concat(res.body.map(l => ({
            type: l.type,
            name: l.name,
            lat: l.lat,
            lon: l.lon,
            id: l.id,
          })))

          this.setState({ loading: false, locations })
        }
      })
  }

  renderItems = (item, isHighlighted) => (
    <div
      className={classNames({
        'search-result': true,
        'search-result-farm': item.type === 'farm',
        'search-result-depot': item.type === 'depot',
        'search-result-location': item.type === 'location',
        'search-result-active': isHighlighted,
      })}
      key={item.id}
      id={item.id}
    >
      {item.name}
    </div>
  )

  renderMenu = (items, value, style) => (
    <div className="search-menu" style={{ ...style }}>
      {items}
    </div>
  )

  render = () => (
    <div className="search">
      <Autocomplete
        inputProps={{
          className: 'search-input',
          placeholder: this.props.defaultValue,
        }}
        renderItem={this.renderItems}
        renderMenu={this.renderMenu}
        onChange={this.handleChange}
        onSelect={this.handleSelect}
        getItemValue={this.getItemValue}
        value={this.state.value}
        items={this.state.locations}
      />
    </div>
  )
}
