import { useMutation, useQuery } from '@tanstack/react-query'
import { LatLngTuple } from 'leaflet'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Layer,
  Map as MapLibre,
  MapMouseEvent,
  NavigationControl,
  Popup,
  Source
} from 'react-map-gl/maplibre'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import Alert from 'react-s-alert'
import Details from '../../components/details/Details'
import { MapViewLayout } from '../../components/layout/MapViewLayout'
import {
  PanelBody,
  PanelHeader,
  PanelTitle
} from '../../components/layout/Panel'
import PlacePopup from '../../components/map/PlacePopup'
import Navigation from '../../components/page/Navigation'
import Search from '../../components/page/Search'
import ListView from '../../components/places/ListView'
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
import { Feature, FeatureCollection, PlaceType } from '../../types/types.ts'

import 'maplibre-gl/dist/maplibre-gl.css'
import {
  clusterLayer,
  dynamicClusterLayer,
  unclusteredPointLayer
} from './layers.ts'
import { getMapStyle } from './mapStyle.ts'

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
      <div className='dual-panel-map'>
        <MapLibre
          initialViewState={{
            longitude: currentPosition[1],
            latitude: currentPosition[0],
            zoom: currentZoom
          }}
          minZoom={config.zoom.min}
          maxZoom={config.zoom.max}
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
      </div>
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
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>()

  useEffect(() => {
    setCurrentZoom(currentCountryZoom)
    setCurrentPosition(currentCountryCenter as LatLngTuple)
  }, [country, currentCountryZoom, currentCountryCenter])

  const initialData = useLoaderData() as LoaderData

  const entriesQuery = useQuery({
    ...getEntriesQuery(),
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
  const entryDetailQuery = useQuery({
    ...getPlaceQuery(params.type!, params.id!),
    enabled: displayMode === 'place'
  })

  useEffect(() => {
    if (entryDetailQuery.data) {
      setCurrentZoom(config.zoom.searchResult)
      setCurrentPosition([
        Number(entryDetailQuery.data.geometry.coordinates[1]),
        Number(entryDetailQuery.data.geometry.coordinates[0] - 0.04)
      ])
      setSelectedItemId(entryDetailQuery.data.properties.id)
    }
  }, [entryDetailQuery.data])

  // location mode
  useQuery({
    ...geocodeLocationIdQuery(params.id),
    queryFn: async (context) => {
      // @ts-ignore
      const { id } = params
      if (!id) return
      const geocodeResult = await geocodeLocationIdQuery(id).queryFn?.(context)
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
      if ((response as any).isVerified) {
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

  const [popupInfo, setPopupInfo] = useState<{
    latitude: number
    longitude: number
    feature: any
  } | null>(null)

  const handleMapClick = useCallback((event: MapMouseEvent) => {
    if (!event.features || event.features.length === 0) return
    const feature = event.features[0]
    setSelectedItemId(feature.properties.id)
    setPopupInfo({
      latitude: event.lngLat.lat,
      longitude: event.lngLat.lng,
      feature
    })
  }, [])

  const handlePopupClose = useCallback(() => {
    setPopupInfo(null)
    setSelectedItemId(undefined)
  }, [])

  const handleListItemClick = useCallback((feature: Feature) => {
    if (feature.geometry.type === 'Point') {
      const [lng, lat] = feature.geometry.coordinates
      setCurrentPosition([lat, lng])
      setCurrentZoom(config.zoom.searchResult)
      setSelectedItemId(feature.properties.id)
      setPopupInfo({
        latitude: lat,
        longitude: lng,
        feature
      })
    }
  }, [])

  // Left Panel Content
  const leftPanelContent = (
    <div className='h-full flex flex-col'>
      <PanelHeader>
        <PanelTitle level={2}>Teikei Map</PanelTitle>
      </PanelHeader>
      <PanelBody scrollable className='flex-1'>
        <div className='space-y-4'>
          <Search useHashRouter />

          {entryDetailQuery.data && entryDetailQuery.data.type && (
            <div className='mt-4'>
              <Details feature={entryDetailQuery.data} />
            </div>
          )}

          {/* New ListView Component */}
          <div className='mt-6 flex-1'>
            <ListView
              data={entriesQuery.data as FeatureCollection}
              isLoading={entriesQuery.isLoading}
              error={entriesQuery.error}
              selectedItemId={selectedItemId}
              onItemClick={handleListItemClick}
              height='60vh'
            />
          </div>
        </div>
      </PanelBody>
      <div className='p-4 border-t'>
        <Navigation />
      </div>
    </div>
  )

  // Right Panel Content (Map)
  const rightPanelContent = (
    <div className='h-full w-full'>
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
  )

  return (
    <MapViewLayout
      leftPanel={leftPanelContent}
      rightPanel={rightPanelContent}
      leftPanelWidth='lg'
    />
  )
}
