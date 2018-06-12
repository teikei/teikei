import React from 'react'
import PropTypes from 'prop-types'
import { Map, TileLayer, GeoJSON } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import MapFooter from './MapFooter'
import Info from './Info'
import Details from '../details/Details'
import Search from '../search/SearchContainer'
import NavigationContainer from '../navigation/NavigationContainer'
import { initClusterIcon, initMarker } from './MarkerCluster'

const MapComponent = ({
  zoom,
  position,
  padding,
  bounds,
  minZoom,
  maxZoom,
  apiKey,
  currentPlace,
  showInfo,
  entries
}) => (
  <div>
    <div className="map-container">
      <div className="leaflet-control-container">
        <div className="custom-controls">
          <Search />
        </div>
      </div>
      <Map
        className="map"
        zoom={zoom}
        center={position}
        boundsOptions={{ paddingTopLeft: padding }}
        bounds={bounds}
        minZoom={minZoom}
        maxZoom={maxZoom}
      >
        <TileLayer
          url={`//{s}.tiles.mapbox.com/v3/${apiKey}/{z}/{x}/{y}.png`}
          attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
        />

        <MarkerClusterGroup
          highlight={currentPlace && currentPlace.id}
          iconCreateFunction={initClusterIcon}
          maxClusterRadius={50}
        >
          {entries.queryResult.features && (
            <GeoJSON data={entries.queryResult} pointToLayer={initMarker} />
          )}
        </MarkerClusterGroup>
      </Map>
    </div>

    <NavigationContainer />

    {currentPlace && <Details place={currentPlace} />}

    {showInfo && <Info />}

    <MapFooter />
  </div>
)

MapComponent.propTypes = {
  entries: PropTypes.object.isRequired,
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