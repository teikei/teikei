import React from 'react'
import { Map, TileLayer } from 'react-leaflet'
import NavigationContainer from '../navigation/NavigationContainer'
import MarkerCluster from './MarkerCluster'
import Search from './Search'

const MapComponent = ({ places, position, zoom, apiKey }) => (
  <div className="map-container">
    <div className="container">
      <div className="custom-controls">
        <Search defaultValue="Ort, Hof oder Initiative" />
      </div>
    </div>
    <Map center={position} zoom={zoom.min} className="map">
      <TileLayer
        url={`//{s}.tiles.mapbox.com/v3/${apiKey}/{z}/{x}/{y}.png`}
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
