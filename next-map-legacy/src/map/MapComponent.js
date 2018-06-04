import React from 'react'
import PropTypes from 'prop-types'
import { Map, TileLayer, Marker } from 'react-leaflet'
// import MarkerCluster from './MarkerCluster'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import MapFooter from './MapFooter'
import Info from './Info'
import Details from '../details/Details'
import Search from '../search/SearchContainer'
import NavigationContainer from '../navigation/NavigationContainer'
import markerIcon from './markerIcon'
import { initClusterIcon } from './MarkerCluster'

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
          attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
        />

        <MarkerClusterGroup
          highlight={props.currentPlace.id}
          iconCreateFunction={initClusterIcon}
          maxClusterRadius={50}
        >
          {props.places.map(place => (
            <Marker
              place={place}
              icon={markerIcon(place.type)}
              position={[place.latitude, place.longitude]}
            />
          ))}
        </MarkerClusterGroup>
      </Map>
    </div>

    <NavigationContainer />

    {props.currentPlace.id && <Details place={props.currentPlace} />}

    {props.showInfo && <Info />}

    <MapFooter />
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
  showInfo: PropTypes.bool.isRequired
}

MapComponent.defaultProps = {
  currentPlace: {},
  position: undefined,
  bounds: undefined,
  padding: []
}

export default MapComponent
