import { createTileLayerComponent, updateGridLayer } from '@react-leaflet/core'
import L from 'leaflet'
import 'mapbox-gl-leaflet'

interface MapboxGLLayerProps {
  styleUrl: string
  [key: string]: any
}

function createTileLayer(
  { styleUrl, ...options }: MapboxGLLayerProps,
  context: any
) {
  return {
    instance: L.mapboxGL({ style: styleUrl, ...options }),
    context
  }
}

const MapboxGLLayer = createTileLayerComponent(createTileLayer, updateGridLayer)

export default MapboxGLLayer
