import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { GeoJSON, Map, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'

import { config } from '../../index'
import Search from '../Search/index'
import { initClusterIcon, initMarker } from './MarkerCluster'
import NavigationContainer from '../Navigation/index'
import Details from '../Details/index'
import Info from './Info'
import MapFooter from './MapFooter'
import { featurePropType } from '../../common/geoJsonUtils'

const MapComponent = ({
  zoom,
  mapTilesUrl,
  position,
  padding,
  bounds,
  minZoom,
  maxZoom,
  apiKey,
  currentPlace,
  showInfo,
  data
}) => (
  <div>
    <div className="map-container">
      <div className="leaflet-control-container">
        <div className="custom-controls">
          <Search useHashRouter />
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
          url={mapTilesUrl}
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        <MarkerClusterGroup
          highlight={currentPlace && currentPlace.id}
          iconCreateFunction={initClusterIcon}
          maxClusterRadius={50}
        >
          {/* TODO the timestamp key forces rerender of the geoJSON layer.
          find a better solution to indicate that the layer should be replaced, eg by setting a changed flag? */}
          <GeoJSON key={Date.now()} data={data} pointToLayer={initMarker} />
        </MarkerClusterGroup>
      </Map>
    </div>

    <NavigationContainer />

    {currentPlace.type && <Details feature={currentPlace} />}

    {showInfo && <Info />}

    <MapFooter />
  </div>
)

MapComponent.propTypes = {
  data: PropTypes.shape({
    type: PropTypes.string.isRequired,
    features: PropTypes.arrayOf(featurePropType)
  }), // geojson
  position: PropTypes.objectOf(PropTypes.number),
  padding: PropTypes.arrayOf(PropTypes.number),
  bounds: PropTypes.arrayOf(PropTypes.array),
  zoom: PropTypes.number.isRequired,
  minZoom: PropTypes.number.isRequired,
  maxZoom: PropTypes.number.isRequired,
  mapTilesUrl: PropTypes.string.isRequired,
  currentPlace: PropTypes.shape(),
  apiKey: PropTypes.string.isRequired,
  showInfo: PropTypes.bool.isRequired
}

MapComponent.defaultProps = {
  data: { type: 'featureCollection', features: [] },
  currentPlace: null,
  position: undefined,
  bounds: undefined,
  padding: []
}

const mapStateToProps = ({ map, details }) => ({
  features: map.features,
  data: map.data,
  position: map.position,
  padding: config.padding,
  currentPlace: details.feature || {},
  zoom: map.zoom,
  minZoom: config.zoom.min,
  maxZoom: config.zoom.max,
  mapTilesUrl: config.mapTilesUrl,
  apiKey: config.apiKey,
  showInfo: map.showInfo
})

const mapDispatchToProps = () => ({})

const MapContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MapComponent)

export default MapContainer
