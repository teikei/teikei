import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect, useDispatch } from 'react-redux'
import { GeoJSON, MapContainer as Map, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'

import { config } from '../../index'
import Search from '../Search/index'
import { initClusterIcon, initMarker } from './MarkerCluster'
import NavigationContainer from '../Navigation/index'
import Details from '../Details/index'
import MapFooter from './MapFooter'
import { featurePropType } from '../../common/geoJsonUtils'
import { requestAllPlaces, showMap, showPosition } from './duck'
import { hidePlace, showPlace } from '../Details/duck'
import { confirmUser, reactivateUser } from '../UserOnboarding/duck'
import { geocodeAndShowOnMap } from '../Search/duck'
import { useQuery } from '../../AppRouter'
import { withRouter } from 'react-router'
import MapboxGLLayer from '../../components/MapboxGLLayer'

// programmatic update of leaflet map based on prop changes
const MapControl = ({ position, zoom }) => {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.setView(position, zoom, {
        animate: true,
      })
    }
  }, [position])
  return null
}

const MapComponent = ({
  zoom,
  mapTilesUrl,
  mapToken,
  mapStyle,
  position,
  padding,
  bounds,
  minZoom,
  maxZoom,
  currentPlace,
  data,
  mode,
  history,
}) => {
  const dispatch = useDispatch()
  const query = useQuery()
  const { id, type, latitude, longitude } = useParams()

  useEffect(() => {
    // show map
    if (mode === 'map') {
      dispatch(showMap())
      dispatch(hidePlace())
      dispatch(requestAllPlaces())
      if (query.has('confirmation_token')) {
        dispatch(confirmUser(query.get('confirmation_token')))
      }
      if (query.has('reactivation_token') && query.has('user_id')) {
        dispatch(
          reactivateUser(query.get('user_id'), query.get('reactivation_token'))
        )
      }
    }

    // show position
    if (mode === 'position') {
      dispatch(hidePlace())
      dispatch(requestAllPlaces()) // fetch data for places
      dispatch(
        showPosition({
          latitude,
          longitude,
        })
      )
    }

    // show place
    if (mode === 'place') {
      dispatch(requestAllPlaces()) // fetch data for places
      if (type === 'locations') {
        dispatch(geocodeAndShowOnMap(id))
      } else {
        dispatch(showPlace(type, id))
      }
    }
  }, [mode, history.location])

  return (
    <div>
      <div className="map-container">
        <div className="leaflet-control-container">
          <div className="custom-controls">
            <Search useHashRouter />
          </div>
        </div>
        {data && data.features.length > 0 && (
          <Map
            className="map"
            zoom={zoom}
            center={position}
            boundsOptions={{ paddingTopLeft: padding }}
            bounds={bounds}
            minZoom={minZoom}
            maxZoom={maxZoom}
          >
            <MapControl position={position} zoom={zoom} />

            <MapboxGLLayer styleUrl={mapStyle} accessToken={mapToken} />

            <MarkerClusterGroup
              highlight={currentPlace && currentPlace.id}
              iconCreateFunction={initClusterIcon}
              maxClusterRadius={50}
            >
              <GeoJSON data={data} pointToLayer={initMarker} />
            </MarkerClusterGroup>
          </Map>
        )}
      </div>

      <NavigationContainer />

      {currentPlace.type && <Details feature={currentPlace} />}

      <MapFooter />

      <a
        href="http://mapbox.com/about/maps"
        className="mapbox-wordmark"
        target="_blank"
        rel="noopener noreferrer"
      >
        Mapbox
      </a>
    </div>
  )
}

MapComponent.propTypes = {
  data: PropTypes.shape({
    type: PropTypes.string.isRequired,
    features: PropTypes.arrayOf(featurePropType),
  }), // geojson
  position: PropTypes.arrayOf(PropTypes.number),
  padding: PropTypes.arrayOf(PropTypes.number),
  bounds: PropTypes.arrayOf(PropTypes.array),
  zoom: PropTypes.number.isRequired,
  minZoom: PropTypes.number.isRequired,
  maxZoom: PropTypes.number.isRequired,
  mapTilesUrl: PropTypes.string.isRequired,
  mapStyle: PropTypes.string.isRequired,
  mapToken: PropTypes.string.isRequired,
  currentPlace: PropTypes.shape(),
  mode: PropTypes.string,
}

MapComponent.defaultProps = {
  data: { type: 'featureCollection', features: [] },
  currentPlace: null,
  position: undefined,
  bounds: undefined,
  padding: [],
  mode: 'map',
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
  mapStyle: config.mapStyle,
  mapToken: config.mapToken,
})

const mapDispatchToProps = () => ({})

const MapContainer = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MapComponent)
)

export default MapContainer
