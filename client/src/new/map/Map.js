import React from 'react'
import { Map, TileLayer } from 'react-leaflet'
import MarkerCluster from './MarkerCluster'
import Search from './Search'

const MapComponent = props => (
  <div>
    <div className="map-container">
      <div className="leaflet-control-container">
        <div className="custom-controls">
          <Search
            defaultValue="Ort, Hof oder Initiative"
          />
        </div>
      </div>
      <Map
        zoom={props.zoom}
        center={props.position}
        className="map"
        boundsOptions={{ paddingTopLeft: props.padding }}
        bounds={props.bounds}
        minZoom={6}
        maxZoom={14}
      >
        <TileLayer
          url={`//{s}.tiles.mapbox.com/v3/${props.apiKey}/{z}/{x}/{y}.png`}
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <MarkerCluster places={props.places} highlight={props.highlight} />
      </Map>
    </div>
  </div>
)

MapComponent.propTypes = {
  places: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  position: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  padding: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  bounds: React.PropTypes.arrayOf(React.PropTypes.array).isRequired,
  zoom: React.PropTypes.number.isRequired,
  highlight: React.PropTypes.number.isRequired,
  apiKey: React.PropTypes.string.isRequired,
}

export default MapComponent
