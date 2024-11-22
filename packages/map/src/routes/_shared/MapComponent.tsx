import { useMutation, useQuery } from '@tanstack/react-query'
import { LatLngTuple } from 'leaflet'
import { useEffect, useState } from 'react'
import { GeoJSON, MapContainer as Map, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import { useLoaderData, useNavigate } from 'react-router'
import { useParams } from 'react-router-dom'
import Alert from 'react-s-alert'
import { useTranslation } from 'react-i18next'
import Details from '../../components/details/Details'
import MapboxGLLayer from '../../components/map/MapboxGLLayer'
import MapFooter from '../../components/map/MapFooter'
import { initClusterIcon, initMarker } from '../../components/map/MarkerCluster'
import Navigation from '../../components/page/Navigation'
import Search from '../../components/page/Search'
import config from '../../configuration'
import { queryClient } from '../../main'
import { geocodeLocationIdQuery } from '../../queries/geo.queries.ts'
import { getEntriesQuery, getPlaceQuery } from '../../queries/places.queries'
import {
  confirmUser,
  ConfirmUserParams,
  reactivateUser,
  ReactivateUserParams
} from '../../queries/users.api'
import { MAP, useQueryString } from '../../routes'
import { useGlobalState } from '../../StateContext'
import { PlaceType } from '../../types/types.ts'

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
  }, [position, zoom, map])
  return null
}

type MapParams = {
  displayMode: 'map' | 'place' | 'position' | 'locations'
  params: { lat?: number; lon?: number; type?: PlaceType; id?: string }
}

const useMapParams = (): MapParams => {
  const { mapType, mapParams } = useParams()
  if (mapType && mapParams) {
    if (mapType === 'position') {
      const [lat, lon] = mapParams.split(',')
      return {
        displayMode: 'position',
        params: {
          lat: parseFloat(lat),
          lon: parseFloat(lon)
        }
      }
    }
    if (['depots', 'farms', 'initiatives'].includes(mapType)) {
      return {
        displayMode: 'place',
        params: {
          type: mapType as PlaceType,
          id: mapParams
        }
      }
    }
    if (mapType === 'locations' && mapParams) {
      return {
        displayMode: 'locations',
        params: {
          id: mapParams
        }
      }
    }
  }
  return {
    displayMode: 'map',
    params: {}
  }
}

export const loader = async () => {
  return queryClient.fetchQuery(getEntriesQuery())
}

export type LoaderData = Awaited<ReturnType<typeof loader>>

export const MapComponent = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { displayMode, params } = useMapParams()

  const { getQueryString, clearQueryString } = useQueryString()

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
  }, [country, currentCountryZoom, currentCountryCenter])

  const initialData = useLoaderData() as LoaderData
  const entriesQuery = useQuery({
    ...getEntriesQuery(),
    initialData
  })

  // place mode
  const entryDetailQuery = useQuery({
    ...getPlaceQuery(params.type!!, params.id!!),
    enabled: displayMode === 'place'
  })

  useEffect(() => {
    if (entryDetailQuery.data) {
      setCurrentZoom(config.zoom.searchResult)
      setCurrentPosition([
        Number(entryDetailQuery.data.geometry.coordinates[1]),
        Number(entryDetailQuery.data.geometry.coordinates[0] - 0.04)
      ])
    }
  }, [entryDetailQuery.data])

  // location mode
  useQuery({
    ...geocodeLocationIdQuery(params.id),
    queryFn: async () => {
      // @ts-ignore
      const { id } = params
      const geocodeResult = await geocodeLocationIdQuery(id).queryFn()
      setCurrentPosition([geocodeResult.latitude, geocodeResult.longitude])
      setCurrentZoom(config.zoom.searchResult)
      return geocodeResult
    },
    enabled: displayMode === 'locations'
  })

  // user activation
  const { mutate: confirmUserMutate } = useMutation({
    mutationFn: async (confirmUserParams: ConfirmUserParams) => {
      const response = await confirmUser(confirmUserParams)
      if (response.isVerified) {
        Alert.success(t('map.activation.success'))
        clearQueryString()
        navigate(MAP)
      } else {
        throw new Error(t('errors.activation_failed'))
      }
      return response
    },
    meta: {
      errorMessage: t('errors.activation_failed')
    }
  })

  // user reactivation
  const { mutate: reactivateUserMutate } = useMutation({
    mutationFn: async (reactivateUserParams: ReactivateUserParams) => {
      const response = await reactivateUser(reactivateUserParams)
      Alert.success(t('map.reactivation.success'))
      clearQueryString()
      navigate(MAP)
      return response
    },
    meta: {
      errorMessage: t('errors.reactivation_failed')
    }
  })

  // map mode
  useEffect(() => {
    if (displayMode === 'map') {
      setCurrentZoom(currentCountryZoom)
      const query = getQueryString()
      if (query.has('confirmation_token')) {
        confirmUserMutate({
          confirmationToken: query.get('confirmation_token')
        })
      }
      if (query.has('reactivation_token') && query.has('user_id')) {
        reactivateUserMutate({
          id: query.get('user_id'),
          token: query.get('reactivation_token')
        })
      }
    } else if (displayMode === 'position') {
      setCurrentPosition([params.lat!, params.lon!])
      setCurrentZoom(config.zoom.searchResult)
    }
  }, [
    displayMode,
    currentCountryZoom,
    getQueryString,
    confirmUserMutate,
    reactivateUserMutate,
    params.lat,
    params.lon
  ])

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
        {t('map.mapbox')}
      </a>
    </div>
  )
}
