import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Layer,
  Map as MapLibre,
  NavigationControl,
  Source
} from '@vis.gl/react-maplibre'
import { LatLngTuple } from 'leaflet'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import Alert from 'react-s-alert'
import Details from '../../components/details/Details'
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
import { FeatureCollection, PlaceType } from '../../types/types.ts'

import 'maplibre-gl/dist/maplibre-gl.css'
import { clusterLayer, unclusteredPointLayer } from './layers.ts'
import { getMapStyle } from './mapStyle.ts'
//
// interface MapControlProps {
//   position: [number, number] | undefined
//   zoom: number | undefined
// }
// //
// const MapControl = ({ position, zoom }: MapControlProps) => {
//   const map = useMap()
//   useEffect(() => {
//     if (position) {
//       map.setView(position, zoom, {
//         animate: true
//       })
//     }
//   }, [position, zoom, map])
//   return null
// }

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

export const MapLibreComponent = () => {
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
          (entriesQuery.data as FeatureCollection) &&
          (entriesQuery.data as FeatureCollection).features.length > 0 && (
            <MapLibre
              initialViewState={{
                longitude: currentPosition[1],
                latitude: currentPosition[0],
                zoom: currentZoom
              }}
              bounds={undefined} // why are there no bounds for the map?
              minZoom={zoom.min}
              maxZoom={zoom.max}
              className='map'
              style={{ width: '100%', height: '100%' }}
              mapStyle={getMapStyle()}
              interactiveLayerIds={[clusterLayer.id]}
            >
              <NavigationControl position='top-left' />
              <Source
                id='entries'
                type='geojson'
                data={entriesQuery.data}
                cluster={true}
                clusterRadius={200}
              >
                <Layer {...clusterLayer} />
                <Layer {...unclusteredPointLayer} />
              </Source>
            </MapLibre>
          )}
      </div>

      <Navigation />

      {entryDetailQuery.data && entryDetailQuery.data.type && (
        <Details feature={entryDetailQuery.data} />
      )}

      {/*<MapFooter />*/}

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
