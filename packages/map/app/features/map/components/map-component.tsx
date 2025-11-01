import type { LatLngTuple } from 'leaflet'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GeoJSON, MapContainer as Map, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import Alert from 'react-s-alert'
import { useConfirmUser } from '~/api/confirm-user'
import { useGeocode } from '~/api/geocode'
import { getEntriesQuery, useGetEntries } from '~/api/get-entries'
import { useGetPlace } from '~/api/get-place'
import { useReactivateUser } from '~/api/reactivate-user'
import Navigation from '~/components/page/navigation'
import Search from '~/components/page/search'
import config from '~/config/app-configuration'
import Details from '~/features/entries/components/details'
import MapFooter from '~/features/map/components/map-footer'
import MapboxGLLayer from '~/features/map/components/mapbox-gl-layer'
import {
  initClusterIcon,
  initMarker
} from '~/features/map/components/marker-cluster'
import { useGlobalState } from '~/hooks/use-global-state'
import { useQueryString } from '~/hooks/use-query-string'
import { queryClient } from '~/lib/query-client'
import { MAP } from '~/routes'
import type { FeatureCollection, PlaceType } from '~/types/types'

interface MapControlProps {
  position: LatLngTuple | undefined
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

export const clientLoader = async () => {
  return queryClient.fetchQuery(getEntriesQuery())
}

export type LoaderData = Awaited<ReturnType<typeof clientLoader>>

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
  const entriesQuery = useGetEntries({
    initialData
  })

  // place mode
  const entryDetailQuery = useGetPlace(
    { type: params.type!, id: params.id! },
    { enabled: displayMode === 'place' }
  )

  useEffect(() => {
    if (entryDetailQuery.data) {
      setCurrentZoom(config.zoom.searchResult)
      setCurrentPosition([
        Number(entryDetailQuery.data.geometry.coordinates[1]),
        Number(entryDetailQuery.data.geometry.coordinates[0] - 0.04)
      ] as LatLngTuple)
    }
  }, [entryDetailQuery.data])

  // location mode
  const geocodeQuery = useGeocode(
    { locationid: params.id },
    {
      enabled: displayMode === 'locations'
    }
  )

  useEffect(() => {
    if (!geocodeQuery.data) return
    setCurrentPosition([
      geocodeQuery.data.latitude,
      geocodeQuery.data.longitude
    ] as LatLngTuple)
    setCurrentZoom(config.zoom.searchResult)
  }, [geocodeQuery.data])

  // user activation
  const confirmUserMutation = useConfirmUser({
    meta: {
      errorMessage: t('errors.activation_failed')
    },
    onSuccess: (response) => {
      if (!(response as any)?.isVerified) {
        Alert.error(t('errors.activation_failed'))
        return
      }

      Alert.success(t('map.activation.success'))
      clearQueryString()
      navigate(MAP)
    }
  })

  const { mutate: confirmUserMutate } = confirmUserMutation

  // user reactivation
  const reactivateUserMutation = useReactivateUser({
    meta: {
      errorMessage: t('errors.reactivation_failed')
    },
    onSuccess: () => {
      Alert.success(t('map.reactivation.success'))
      clearQueryString()
      navigate(MAP)
    }
  })

  const { mutate: reactivateUserMutate } = reactivateUserMutation

  // map mode
  useEffect(() => {
    if (displayMode === 'map') {
      setCurrentZoom(currentCountryZoom)
      const query = getQueryString()
      const confirmationToken = query.get('confirmation_token')
      if (confirmationToken) {
        confirmUserMutate({
          confirmationToken
        })
      }
      const reactivationToken = query.get('reactivation_token')
      const userId = query.get('user_id')
      if (reactivationToken && userId) {
        reactivateUserMutate({
          id: userId,
          token: reactivationToken
        })
      }
    } else if (displayMode === 'position') {
      setCurrentPosition([params.lat!, params.lon!] as LatLngTuple)
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

  const entriesData = entriesQuery.data as FeatureCollection | undefined
  const MapboxLayer = MapboxGLLayer as any

  return (
    <div>
      <div className='map-container'>
        <div className='leaflet-control-container'>
          <div className='custom-controls'>
            <Search />
          </div>
        </div>
        {currentPosition && entriesData && entriesData.features.length > 0 && (
          <Map
            className='map'
            zoom={currentZoom}
            center={currentPosition}
            boundsOptions={{ paddingTopLeft: padding as [number, number] }}
            bounds={undefined} // why are there no bounds for the map?
            minZoom={zoom.min}
            maxZoom={zoom.max}
          >
            <MapControl position={currentPosition} zoom={currentZoom} />

            <MapboxLayer styleUrl={mapStyle} accessToken={mapToken} />

            <MarkerClusterGroup
              highlight={entryDetailQuery.data && entryDetailQuery.data.id}
              iconCreateFunction={initClusterIcon}
              maxClusterRadius={50}
            >
              <GeoJSON data={entriesData as any} pointToLayer={initMarker} />
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
