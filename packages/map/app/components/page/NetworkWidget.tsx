import config from '~/configuration'
import { useQuery } from '@tanstack/react-query'
import * as turf from '@turf/turf'
import { LatLngBounds } from 'leaflet'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GeoJSON, MapContainer as Map, useMap } from 'react-leaflet'

import MapFooter from '~/components/map/MapFooter'
import MapboxGLLayer from '~/components/map/MapboxGLLayer'
import { initMarker } from '~/components/map/MarkerCluster'
import { getPlaceQuery } from '~/queries/places.queries' 
interface MapControlProps {
  bounds: LatLngBounds | undefined
}

const MapControl = ({ bounds }: MapControlProps) => {
  const map = useMap()
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, {
        animate: true
      })
    }
  }, [bounds, map])
  return null
}

export const NetworkWidget = () => {
  const { t } = useTranslation()

  const { zoom, mapStyle, mapToken, farmId } = config

  const [currentBounds, setCurrentBounds] = useState<LatLngBounds | undefined>()

  const placeQuery = useQuery({
    ...getPlaceQuery('farms', farmId)
  })

  const network = useMemo(
    () =>
      placeQuery.data
        ? [placeQuery.data, ...placeQuery.data.properties.depots.features]
        : [],
    [placeQuery.data]
  )

  // map mode
  useEffect(() => {
    if (!network || network.length == 0) {
      return
    }
    const networkBounds = turf.bbox({
      type: 'FeatureCollection',
      features: network
    })
    const latLngBounds = new LatLngBounds(
      [networkBounds[1], networkBounds[0]], // southwest [minLat, minLng]
      [networkBounds[3], networkBounds[2]] // northeast [maxLat, maxLng]
    )
    setCurrentBounds(latLngBounds)
  }, [network])

  return (
    <div>
      <div className='map-container network-widget'>
        {network && network.length > 0 && (
          <Map className='map' zoom={8} minZoom={zoom.min} maxZoom={zoom.max}>
            <MapControl bounds={currentBounds} />
            <MapboxGLLayer styleUrl={mapStyle} accessToken={mapToken} />
            <GeoJSON data={network} pointToLayer={initMarker} />
          </Map>
        )}
      </div>

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
