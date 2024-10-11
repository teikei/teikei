import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { GeoJSON, MapContainer as Map, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import { useMutation, useQuery } from '@tanstack/react-query'
import Alert from 'react-s-alert'
import { useLoaderData, useNavigate } from 'react-router'
import { LatLngTuple } from 'leaflet'

import config from '../../configuration'
import Search from '../../components/page/Search'
import { initClusterIcon, initMarker } from '../../components/map/MarkerCluster'
import Navigation from '../../components/page/Navigation'
import Details from '../../components/details/Details'
import MapFooter from '../../components/map/MapFooter'
import { history, MAP, useQueryString } from '../../routes'
import MapboxGLLayer from '../../components/map/MapboxGLLayer'
import { geocode, getPlace } from '../../queries/places.api'
import { confirmUser, reactivateUser } from '../../queries/users.api.ts'
import { useGlobalState } from '../../StateContext'
import { getEntriesQuery } from '../../queries/places.queries.ts'
import { queryClient } from '../../App.tsx'

interface MapControlProps {
  position: [number, number] | undefined
  zoom: number | undefined
}

const MapControl = ({ position, zoom }: MapControlProps) => {
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

interface MapComponentProps {
  mode: 'map' | 'place' | 'position'
}

export const loader = async () => {
  return queryClient.fetchQuery(getEntriesQuery())
}

export const MapComponent = ({ mode = 'map' }: MapComponentProps) => {
  const navigate = useNavigate()
  const query = useQueryString()
  const { id, type } = useParams<{ id: string; type: string }>()

  const { padding, zoom, mapStyle, mapToken, countries } = config

  const { country } = useGlobalState()
  const { zoom: currentCountryZoom, center: currentCountryCenter } =
    countries[country as keyof typeof countries]

  const [currentZoom, setCurrentZoom] = useState<number | undefined>()
  const [currentPosition, setCurrentPosition] = useState<
    LatLngTuple | undefined
  >()

  useEffect(() => {
    setCurrentZoom(currentCountryZoom)
    setCurrentPosition(currentCountryCenter as LatLngTuple)
  }, [country])

  const initialData = useLoaderData() as Awaited<ReturnType<typeof loader>>

  const entriesQuery = useQuery({
    ...getEntriesQuery,
    onError: () => {
      Alert.error('Die Einträge konnten nicht geladen werden.')
    },
    initialData
  })

  const entryDetailQuery = useQuery({
    queryKey: ['getPlace', type, id],
    queryFn: async () => {
      const response = await getPlace(type, id)
      setCurrentZoom(config.zoom.searchResult)
      setCurrentPosition([
        Number(response.geometry.coordinates[1]),
        Number(response.geometry.coordinates[0] - 0.04)
      ])
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
      navigate(MAP)
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
      navigate(MAP)
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
