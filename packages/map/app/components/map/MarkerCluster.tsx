import Leaflet from 'leaflet'
import { renderToString } from 'react-dom/server'
import MarkerClusterIcon from '~/components/map/MarkerClusterIcon'
import PlacePopup from '~/components/map/PlacePopup'
import markerIcon from '~/components/map/markerIcon'
import config from '~/configuration'

const BASE_DIAMETER = 70
const FACTOR = 1.1

interface Feature {
  properties: {
    type: string
  }
}

interface Cluster {
  getAllChildMarkers: () => { feature: Feature }[]
}

export const initMarker = (feature: Feature, latlng: Leaflet.LatLng) => {
  const icon = markerIcon(feature.properties.type)
  const popup = renderToString(<PlacePopup feature={feature} />)

  return Leaflet.marker(latlng, { feature, icon }).bindPopup(popup, {
    autoPanPaddingTopLeft: config.padding
  })
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
