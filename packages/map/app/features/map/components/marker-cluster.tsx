import Leaflet from 'leaflet'
import { renderToString } from 'react-dom/server'
import config from '~/config/app-configuration'
import MarkerClusterIcon from '~/features/map/components/marker-cluster-icon'
import markerIcon from '~/features/map/components/marker-icon'
import PlacePopup from '~/features/map/components/place-popup'
import type { Feature as FeatureType } from '~/types/types'

const BASE_DIAMETER = 70
const FACTOR = 1.1

interface MarkerWithFeature extends Leaflet.Marker {
  feature: FeatureType
}

interface Cluster {
  getAllChildMarkers: () => MarkerWithFeature[]
}

export const initMarker = (
  feature: FeatureType,
  latlng: Leaflet.LatLng
): MarkerWithFeature => {
  const icon = markerIcon(feature.properties.type)
  const popup = renderToString(<PlacePopup feature={feature} />)

  const marker = Leaflet.marker(latlng, {
    icon
  }).bindPopup(popup, {
    autoPanPaddingTopLeft: config.padding as Leaflet.PointTuple
  }) as MarkerWithFeature
  marker.feature = feature
  return marker
}

export const initClusterIcon = (cluster: Cluster) => {
  const markers = cluster.getAllChildMarkers()
  const features = markers.map((m) => m.feature)

  const diameter = features.length * FACTOR + BASE_DIAMETER

  return Leaflet.divIcon({
    className: 'cluster',
    iconSize: Leaflet.point(diameter, diameter),
    html: renderToString(<MarkerClusterIcon features={features} />)
  })
}
