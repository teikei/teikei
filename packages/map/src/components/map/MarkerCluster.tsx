import Leaflet from 'leaflet'
import { renderToString } from 'react-dom/server'
import config from '../../configuration'
import MarkerClusterIcon from './MarkerClusterIcon'
import markerIcon from './markerIcon'
import PlacePopup from './PlacePopup'

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
