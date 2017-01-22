import React from 'react'
import request from 'superagent'
import Autocomplete from 'react-autocomplete'

const styles = {

}

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
      .get('/api/v1/places/search')
      .query({ name: value })
      .end((err, res) => {
        if (err) {
          this.setState({ loading: false })
        } else {
          locations = locations.concat(res.body.map(l => ({
            id: l.id,
            name: l.name,
            lat: l.latitude,
            lon: l.longitude,
            type: l.type.toLowerCase(),
          })))
          this.setState({ loading: false, locations })
        }
      })
    request
      .get('/api/v1/geocode')
      .query({ location: value })
      .end((err, res) => {
        if (err) {
          this.setState({ loading: false })
        } else {
          locations = locations.concat(res.body.map(l => ({
            name: l.attrs.display_name,
            lat: l.attrs.lat,
            lon: l.attrs.lon,
            type: 'location',
          })))
          this.setState({ loading: false, locations })
        }
      })
  }

  renderItems = (item, isHighlighted) => (
    <div
      style={isHighlighted ? styles.highlightedItem : styles.item}
      key={item.id}
      className={`searchresult-${item.type}`}
      id={item.id}
    >
      {item.name}
    </div>
  )

  render() {
    return (
      <Autocomplete
        inputProps={{
          className: 'search-input',
          placeholder: this.props.defaultValue,
        }}
        onChange={this.handleChange}
        onSelect={this.handleSelect}
        getItemValue={this.getItemValue}
        value={this.state.value}
        items={this.state.locations}
        renderItem={this.renderItems}
      />
    )
  }
}
