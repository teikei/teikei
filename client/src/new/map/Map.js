import React, { Component } from 'react'
import request from 'superagent'
import { Map, TileLayer } from 'react-leaflet'
import conf from '../../configuration'
import NavigationContainer from '../navigation/NavigationContainer'
import MarkerCluster from './MarkerCluster'

const position = [conf.center.lat, conf.center.lon];

class TeikeiMap extends Component {

  constructor(props) {
    super(props)
    this.state = { places: [], loggedIn: (Teikei.currentUser !== null) }

    request
      .get('/api/v1/places')
      .end((err, res) => {
        if (!err) {
          this.setState({ places: res.body })
        }
      })
  }

  getCurrentUserName() {
    if (this.state.loggedIn) {
      return Teikei.currentUser.name
    }
    return ''
  }

  render() {
    return (
      <div className="map-container">
        <Map center={position} zoom={conf.zoom.min} className="map">
          <TileLayer
            url={`//{s}.tiles.mapbox.com/v3/${conf.apiKey}/{z}/{x}/{y}.png`}
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />

          <MarkerCluster
            places={this.state.places}
          />
        </Map>
        <NavigationContainer />
      </div>
    )
  }
}

export default TeikeiMap
