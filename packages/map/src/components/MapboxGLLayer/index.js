import { createTileLayerComponent, updateGridLayer } from '@react-leaflet/core'
import L from 'leaflet'
import 'mapbox-gl-leaflet'

function createTileLayer({ styleUrl, ...options }, context) {
  return {
    instance: L.mapboxGL({ style: styleUrl, ...options }),
    context
  }
}

const MapboxGLLayer = createTileLayerComponent(createTileLayer, updateGridLayer)

export default MapboxGLLayer
