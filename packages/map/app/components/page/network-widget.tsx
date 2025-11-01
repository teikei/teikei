import * as turf from '@turf/turf'
import { LatLngBounds } from 'leaflet'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GeoJSON, MapContainer as Map, useMap } from 'react-leaflet'
import { useGetPlace } from '~/api/get-place'
import config from '~/config/app-configuration'
import MapFooter from '~/features/map/components/map-footer'
import MapboxGLLayer from '~/features/map/components/mapbox-gl-layer'
import { initMarker } from '~/features/map/components/marker-cluster'

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

  const placeQuery = useGetPlace({ type: 'farms', id: farmId })

  const networkFeatures = useMemo(() => {
    if (!placeQuery.data) {
      return []
    }

    return [
      placeQuery.data,
      ...(placeQuery.data.properties.depots.features || [])
    ]
  }, [placeQuery.data])

  const networkCollection = useMemo(() => {
    if (!networkFeatures.length) {
      return null
    }

    return {
      type: 'FeatureCollection' as const,
      features: networkFeatures
    }
  }, [networkFeatures])

  // map mode
  useEffect(() => {
    if (!networkCollection) {
      return
    }
    const networkBounds = turf.bbox(networkCollection)
    const latLngBounds = new LatLngBounds(
      [networkBounds[1], networkBounds[0]], // southwest [minLat, minLng]
      [networkBounds[3], networkBounds[2]] // northeast [maxLat, maxLng]
    )
    setCurrentBounds(latLngBounds)
  }, [networkCollection])

  const MapboxLayer = MapboxGLLayer as any

  return (
    <div>
      <div className='map-container network-widget'>
        {networkCollection && (
          <Map className='map' zoom={8} minZoom={zoom.min} maxZoom={zoom.max}>
            <MapControl bounds={currentBounds} />
            <MapboxLayer styleUrl={mapStyle} accessToken={mapToken} />
            <GeoJSON
              data={networkCollection as any}
              pointToLayer={initMarker}
            />
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
