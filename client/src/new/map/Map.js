import React from 'react'
import { Map, TileLayer } from 'react-leaflet'
import MarkerCluster from './MarkerCluster'
import Details from '../details/Details'
import Search from '../search/SearchContainer'

const MapComponent = (props) => (
  <div>
    <div className="map-container">
      <div className="leaflet-control-container">
        <div className="custom-controls">
          <Search />
        </div>
      </div>

      {props.currentPlace.id && <Details place={props.currentPlace} />}

      <Map
        className="map"
        zoom={props.zoom}
        center={props.position}
        boundsOptions={{ paddingTopLeft: props.padding }}
        bounds={props.bounds}
        minZoom={6}
        maxZoom={14}
      >
        <TileLayer
          url={`//{s}.tiles.mapbox.com/v3/${props.apiKey}/{z}/{x}/{y}.png`}
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <MarkerCluster
          places={props.places}
          highlight={props.currentPlace.id}
        />
      </Map>
    </div>
  </div>
)


MapComponent.propTypes = {
  places: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  position: React.PropTypes.arrayOf(React.PropTypes.number),
  padding: React.PropTypes.arrayOf(React.PropTypes.number),
  bounds: React.PropTypes.arrayOf(React.PropTypes.array),
  zoom: React.PropTypes.number.isRequired,
  currentPlace: React.PropTypes.shape(),
  apiKey: React.PropTypes.string.isRequired,
}

MapComponent.defaultProps = {
  currentPlace: {},
  position: undefined,
  bounds: undefined,
  padding: [],
}

export default MapComponent
