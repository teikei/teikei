import React from 'react'
import { Map, TileLayer } from 'react-leaflet'
import conf from '../../configuration'
import NavigationContainer from '../navigation/NavigationContainer'
import MarkerCluster from './MarkerCluster'

const position = [conf.center.lat, conf.center.lon];

const MapComponent = ({ places }) => (
  <div className="map-container">
    <Map center={position} zoom={conf.zoom.min} className="map">
      <TileLayer
        url={`//{s}.tiles.mapbox.com/v3/${conf.apiKey}/{z}/{x}/{y}.png`}
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <MarkerCluster places={places} />
    </Map>
    <NavigationContainer />
  </div>
)

MapComponent.propTypes = {
  places: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
}

export default MapComponent
