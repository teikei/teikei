import React from 'react'
import { Map, TileLayer } from 'react-leaflet'
import NavigationContainer from '../navigation/NavigationContainer'
import MarkerCluster from './MarkerCluster'
import Search from './Search'

const MapComponent = ({ places, position, zoom, apiKey }) => (
  <div className="map-container">
    <div className="container">
      <div className="custom-controls">
        <Search
          defaultValue="Ort, Hof oder Initiative"
          onSelect={newPosition => console.log('TODO: zoom to', newPosition)}
        />
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
  position: React.PropTypes.shape({
    lat: React.PropTypes.number,
    lon: React.PropTypes.number,
  }).isRequired,
  zoom: React.PropTypes.shape({
    default: React.PropTypes.number,
    min: React.PropTypes.number,
    max: React.PropTypes.number,
    searchResult: React.PropTypes.number,
  }).isRequired,
  apiKey: React.PropTypes.string.isRequired,
}

export default MapComponent
