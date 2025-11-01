import type { LatLngTuple } from 'leaflet'
import config from '~/config/app-configuration'
import { queryClient } from '~/lib/query-client'
import { MAP, useQueryString } from '~/lib/routes'
import { useGlobalState } from '~/lib/state-context'

import 'maplibre-gl/dist/maplibre-gl.css'

import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Layer,
  Map as MapLibre,
  NavigationControl,
  Popup,
  Source
} from 'react-map-gl/maplibre'
import type { MapMouseEvent } from 'react-map-gl/maplibre'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import Alert from 'react-s-alert'
import { useConfirmUser } from '~/api/confirm-user'
import { useGeocode } from '~/api/geocode'
import { getEntriesQuery, useGetEntries } from '~/api/get-entries'
import { useGetPlace } from '~/api/get-place'
import { useReactivateUser } from '~/api/reactivate-user'
import Navigation from '~/components/page/navigation'
import Search from '~/components/page/search'
import Details from '~/features/entries/components/details'
import PlacePopup from '~/features/map/components/place-popup'
import { getMapStyle } from '~/features/map/utils/map-style'
import type { FeatureCollection, PlaceType } from '~/types/types'

import {
  clusterLayer,
  dynamicClusterLayer,
  unclusteredPointLayer
} from '../utils/layers'

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

type MemoizedMapProps = {
  currentPosition: LatLngTuple
  currentZoom: number | undefined
  entriesQuery: any
  dynamicClusterLayer: any
  unclusteredPointLayer: any
  onMapClick: (event: MapMouseEvent) => void
  popupInfo: { latitude: number; longitude: number; feature: any } | null
  onPopupClose: () => void
}

const mapStyle = getMapStyle()

const MemoizedMap = memo(
  ({
    currentPosition,
    currentZoom,
    entriesQuery,
    dynamicClusterLayer,
    unclusteredPointLayer,
    onMapClick,
    popupInfo,
    onPopupClose
  }: MemoizedMapProps) => {
    const sourceMemo = useMemo(
      () => (
        <Source
          id='entries'
          type='geojson'
          data={entriesQuery.data}
          cluster={true}
          clusterRadius={20}
        >
          <Layer {...dynamicClusterLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>
      ),
      [entriesQuery.data, dynamicClusterLayer, unclusteredPointLayer]
    )

    return (
      <MapLibre
        initialViewState={{
          longitude: currentPosition[1],
          latitude: currentPosition[0],
          zoom: currentZoom
        }}
        minZoom={config.zoom.min}
        maxZoom={config.zoom.max}
        // className='map'
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        interactiveLayerIds={[clusterLayer.id, unclusteredPointLayer.id]}
        onClick={onMapClick}
      >
        <NavigationControl position='top-left' />
        {sourceMemo}
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            closeOnClick={false}
            onClose={onPopupClose}
          >
            <PlacePopup feature={popupInfo.feature} />
          </Popup>
        )}
      </MapLibre>
    )
  }
)

export const MapLibreComponent = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { displayMode, params } = useMapParams()

  const { getQueryString, clearQueryString } = useQueryString()

  const { countries } = config

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
    initialData,
    select: (data) => {
      const featureCollection = data as FeatureCollection
      return {
        ...featureCollection,
        features: featureCollection.features.filter(
          (feature) =>
            feature.properties.type === 'Farm' ||
            feature.properties.type === 'Initiative'
        )
      }
    }
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
      if (query.has('confirmation_token')) {
        const token = query.get('confirmation_token') || ''
        confirmUserMutate({
          confirmationToken: token
        })
      }
      if (query.has('reactivation_token') && query.has('user_id')) {
        const userId = query.get('user_id') || ''
        const token = query.get('reactivation_token') || ''
        reactivateUserMutate({
          id: userId,
          token: token
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

  const [popupInfo, setPopupInfo] = useState<{
    latitude: number
    longitude: number
    feature: any
  } | null>(null)

  const handleMapClick = useCallback((event: MapMouseEvent) => {
    if (!event.features || event.features.length === 0) return
    const feature = event.features[0]
    setPopupInfo({
      latitude: event.lngLat.lat,
      longitude: event.lngLat.lng,
      feature
    })
  }, [])

  const handlePopupClose = useCallback(() => setPopupInfo(null), [])

  return (
    <div>
      <div className='map-container w-full h-full absolute top-0 left-0'>
        <div className='leaflet-control-container absolute left-30 top-0 mt-10 z-10'>
          <div className='custom-controls w-30'>
            <Search useHashRouter />
          </div>
        </div>
        {currentPosition &&
          (entriesQuery.data as FeatureCollection) &&
          (entriesQuery.data as FeatureCollection).features.length > 0 && (
            <MemoizedMap
              currentPosition={currentPosition}
              currentZoom={currentZoom}
              entriesQuery={entriesQuery}
              dynamicClusterLayer={dynamicClusterLayer}
              unclusteredPointLayer={unclusteredPointLayer}
              onMapClick={handleMapClick}
              popupInfo={popupInfo}
              onPopupClose={handlePopupClose}
            />
          )}
      </div>
      <Navigation />
      {entryDetailQuery.data && entryDetailQuery.data.type && (
        <Details feature={entryDetailQuery.data} />
      )}
    </div>
  )
}
