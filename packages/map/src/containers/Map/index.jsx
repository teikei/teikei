import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { GeoJSON, MapContainer as Map, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'

import { config } from '../../main'
import Search from '../Search/index'
import { initClusterIcon, initMarker } from './MarkerCluster'
import NavigationContainer from '../Navigation/index'
import Details from '../Details/index'
import MapFooter from './MapFooter'
import { confirmUser, reactivateUser } from '../UserOnboarding/duck'
import { useQueryString } from '../../AppRouter'
import { withRouter } from 'react-router'
import MapboxGLLayer from '../../components/MapboxGLLayer'
import { useQuery } from '@tanstack/react-query'
import { getEntries, getPlace } from '../../api/places'
import Alert from 'react-s-alert'

// programmatic update of leaflet map based on prop changes
const MapControl = ({ position, zoom }) => {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.setView(position, zoom, {
        animate: true
      })
    }
  }, [position])
  return null
}

const MapComponent = ({ mode = 'map' }) => {
  const dispatch = useDispatch()
  const query = useQueryString()
  const { id, type } = useParams()

  const { padding, zoom, mapStyle, mapToken, country, countries } = config

  const currentCountryZoom = countries[country].zoom
  const currentCountryCenter = countries[country].center

  const [currentZoom, setCurrentZoom] = useState(currentCountryZoom)
  const [currentPosition, setCurrentPosition] = useState(currentCountryCenter)

  const entriesQuery = useQuery({
    queryKey: ['getPlaces'],
    queryFn: () => getEntries(),
    onError: () => {
      Alert.error('Die Einträge konnten nicht geladen werden.')
    }
  })

  const entryDetailQuery = useQuery({
    queryKey: ['getPlace', type, id],
    queryFn: async () => {
      const response = await getPlace(type, id)
      setCurrentZoom(config.zoom.searchResult)
      setCurrentPosition({
        lon: Number(response.geometry.coordinates[0] - 0.04),
        lat: Number(response.geometry.coordinates[1])
      })
      return response
    },
    onError: () => {
      Alert.error('Der Eintrag konnte nicht geladen werden.')
    },
    enabled: mode === 'place'
  })

  useEffect(() => {
    if (mode === 'map') {
      setCurrentZoom(currentCountryZoom)
      if (query.has('confirmation_token')) {
        dispatch(confirmUser(query.get('confirmation_token')))
      }
      if (query.has('reactivation_token') && query.has('user_id')) {
        dispatch(
          reactivateUser(query.get('user_id'), query.get('reactivation_token'))
        )
      }
    }
  }, [mode])

  // useEffect(() => {
  //   // show currentPosition
  //   if (mode === 'position') {
  //     dispatch(
  //       showPosition({
  //         latitude,
  //         longitude
  //       })
  //     )
  //   }
  //
  //   // show place
  //   if (mode === 'place') {
  //     if (type === 'locations') {
  //       dispatch(geocodeAndShowOnMap(id))
  //     } else {
  //       // dispatch(showPlace(type, id))
  //     }
  //   }
  // }, [mode, history.location])

  return (
    <div>
      <div className='map-container'>
        <div className='leaflet-control-container'>
          <div className='custom-controls'>
            <Search useHashRouter />
          </div>
        </div>
        {entriesQuery.data && entriesQuery.data.features.length > 0 && (
          <Map
            className='map'
            zoom={currentZoom}
            center={currentPosition}
            boundsOptions={{ paddingTopLeft: padding }}
            bounds={undefined} // why are there no bounds for the map?
            minZoom={zoom.min}
            maxZoom={zoom.max}
          >
            <MapControl position={currentPosition} zoom={currentZoom} />

            <MapboxGLLayer styleUrl={mapStyle} accessToken={mapToken} />

            <MarkerClusterGroup
              highlight={entryDetailQuery.data && entryDetailQuery.data.id}
              iconCreateFunction={initClusterIcon}
              maxClusterRadius={50}
            >
              <GeoJSON
                data={entriesQuery.data.features}
                pointToLayer={initMarker}
              />
            </MarkerClusterGroup>
          </Map>
        )}
      </div>

      <NavigationContainer />

      {entryDetailQuery.data && entryDetailQuery.data.type && (
        <Details feature={entryDetailQuery.data} />
      )}

      <MapFooter />

      <a
        href='http://mapbox.com/about/maps'
        className='mapbox-wordmark'
        target='_blank'
        rel='noopener noreferrer'
      >
        Mapbox
      </a>
    </div>
  )
}

MapComponent.propTypes = {
  mode: PropTypes.string
}

const MapContainer = withRouter(MapComponent)

export default MapContainer
