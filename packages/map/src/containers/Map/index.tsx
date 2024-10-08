import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import { GeoJSON, MapContainer as Map, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import { useMutation, useQuery } from '@tanstack/react-query'
import Alert from 'react-s-alert'

import { config } from '../../main'
import Search from '../Search'
import { initClusterIcon, initMarker } from './MarkerCluster'
import Navigation from '../Navigation'
import Details from '../Details'
import MapFooter from './MapFooter'
import { history, MAP, useQueryString } from '../../AppRouter'
import MapboxGLLayer from '../../components/MapboxGLLayer'
import { geocode, getEntries, getPlace } from '../../api/places'
import { confirmUser, reactivateUser } from '../../api/user'
import { useGlobalState } from '../../StateContext'

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
  const query = useQueryString()
  const { id, type } = useParams()

  const { padding, zoom, mapStyle, mapToken, countries } = config

  const { country } = useGlobalState()
  const currentCountryZoom = countries[country].zoom
  const currentCountryCenter = countries[country].center

  const [currentZoom, setCurrentZoom] = useState()
  const [currentPosition, setCurrentPosition] = useState()

  useEffect(() => {
    setCurrentZoom(currentCountryZoom)
    setCurrentPosition(currentCountryCenter)
  }, [country])

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
    enabled: mode === 'place' && type !== 'locations'
  })

  useQuery({
    queryKey: ['geocode', id],
    queryFn: async () => {
      const geocodeResult = await geocode(id)
      setCurrentPosition([geocodeResult.latitude, geocodeResult.longitude])
      setCurrentZoom(config.zoom.searchResult)
      return geocodeResult
    },
    enabled: type === 'locations' && id !== undefined
  })

  const confirmUserMutation = useMutation({
    mutationFn: async (confirmationParams) => {
      const response = await confirmUser(confirmationParams)
      Alert.success(
        'Vielen Dank! Dein Benutzerkonto wurde bestätigt und ist nun freigeschaltet.'
      )
      history.push(MAP)
      return response
    },
    onError: (error) => {
      Alert.error(
        `Dein Benutzerkonto konnte nicht aktiviert werden: ${error.message}`
      )
    }
  })

  const reactivateUserMutation = useMutation({
    mutationFn: async (reactivationParams) => {
      const response = await reactivateUser(reactivationParams)
      Alert.success('Vielen Dank! Dein Konto wurde bestätigt und bleibt aktiv.')
      history.push(MAP)
      return response
    },
    onError: (error) => {
      Alert.error(
        `Dein Konto konnte nicht reaktiviert werden: ${error.message}`
      )
    }
  })

  useEffect(() => {
    if (mode === 'map') {
      setCurrentZoom(currentCountryZoom)
      if (query.has('confirmation_token')) {
        confirmUserMutation.mutate({
          confirmationToken: query.get('confirmation_token')
        })
      }
      if (query.has('reactivation_token') && query.has('user_id')) {
        reactivateUserMutation.mutate({
          id: query.get('user_id'),
          reactivationToken: query.get('reactivation_token')
        })
      }
    }
  }, [mode])

  return (
    <div>
      <div className='map-container'>
        <div className='leaflet-control-container'>
          <div className='custom-controls'>
            <Search useHashRouter />
          </div>
        </div>
        {currentPosition &&
          entriesQuery.data &&
          entriesQuery.data.features.length > 0 && (
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

      <Navigation />

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
