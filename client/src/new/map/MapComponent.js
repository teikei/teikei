import React, { PropTypes } from 'react'
import { Map, TileLayer } from 'react-leaflet'
import MarkerCluster from './MarkerCluster'
import Details from '../details/Details'
import Search from '../search/SearchContainer'

const MapComponent = props => (
  <div>
    <div className="map-container">
      <div className="leaflet-control-container">
        <div className="custom-controls">
          <Search />
        </div>
      </div>
      <Map
        className="map"
        zoom={props.zoom}
        center={props.position}
        boundsOptions={{ paddingTopLeft: props.padding }}
        bounds={props.bounds}
        minZoom={props.minZoom}
        maxZoom={props.maxZoom}
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

    {props.currentPlace.id && <Details place={props.currentPlace} />}

  </div>
)


MapComponent.propTypes = {
  places: PropTypes.arrayOf(PropTypes.object).isRequired,
  position: PropTypes.objectOf(PropTypes.number),
  padding: PropTypes.arrayOf(PropTypes.number),
  bounds: PropTypes.arrayOf(PropTypes.array),
  zoom: PropTypes.number.isRequired,
  minZoom: PropTypes.number.isRequired,
  maxZoom: PropTypes.number.isRequired,
  currentPlace: PropTypes.shape(),
  apiKey: PropTypes.string.isRequired,
}

MapComponent.defaultProps = {
  currentPlace: {},
  position: undefined,
  bounds: undefined,
  padding: [],
}

export default MapComponent
