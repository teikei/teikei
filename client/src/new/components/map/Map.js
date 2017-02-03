import React, { Component } from 'react'
import request from 'superagent'
import { Map, Marker, TileLayer } from 'react-leaflet'
import conf from '../../../configuration'
import createIcon from './markerIcon'
import PlacePopup from './PlacePopup'
import Navigation from '../navigation/Navigation'

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
          {this.state.places.map(p =>
            <Marker
              key={p.id}
              position={{ lat: p.latitude, lon: p.longitude }}
              icon={createIcon(p.type)}
            >
              <PlacePopup place={p} />
            </Marker>)}
        </Map>
        <Navigation loggedIn={this.state.loggedIn} username={this.getCurrentUserName()} />
      </div>
    )
  }
}

export default TeikeiMap
