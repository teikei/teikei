import React from 'react'
import { Map, TileLayer } from 'react-leaflet'
import MarkerCluster from './MarkerCluster'
import Search from './Search'

const MapComponent = ({ places, position, zoom, apiKey }) => (
  <div>
    <div className="map-container">
      <div className="leaflet-control-container">
        <div className="custom-controls">
          <Search
            defaultValue="Ort, Hof oder Initiative"
          />
        </div>
      </div>
      <Map center={position} zoom={zoom} className="map">
        <TileLayer
          url={`//{s}.tiles.mapbox.com/v3/${apiKey}/{z}/{x}/{y}.png`}
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <MarkerCluster places={places} />
      </Map>
    </div>
  </div>
)

MapComponent.propTypes = {
  places: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  position: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  zoom: React.PropTypes.number.isRequired,
  apiKey: React.PropTypes.string.isRequired,
}

export default MapComponent
