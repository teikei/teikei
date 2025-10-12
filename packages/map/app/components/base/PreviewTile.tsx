import config from '~/configuration'

const PREVIEW_TILE_WIDTH = 600
const PREVIEW_TILE_HEIGHT = 240
const PREVIEW_TILE_ZOOM_LEVEL = 14

const tileUrl = (latitude: number | null, longitude: number | null): string => {
  if (!latitude && !longitude) {
    return `url(${config.assetsBaseUrl}/placeimage-placeholder.png)`
  }
  return `url(${config.mapStaticUrl})`
    .replace('{zoom}', PREVIEW_TILE_ZOOM_LEVEL.toString())
    .replace('{width}', PREVIEW_TILE_WIDTH.toString())
    .replace('{height}', PREVIEW_TILE_HEIGHT.toString())
    .replace('{lat}', latitude?.toString() || '')
    .replace('{lon}', longitude?.toString() || '')
}

const markerUrl = (markerIcon: string | null): string => {
  if (markerIcon) {
    return `${config.assetsBaseUrl}/marker-${markerIcon.toLowerCase()}.svg`
  }
  return ''
}

const markerDisplay = (markerIcon: string | null): string => {
  if (markerIcon) {
    return 'block'
  }
  return 'none'
}

interface PreviewTileProps {
  latitude?: number | null
  longitude?: number | null
  markerIcon: 'Farm' | 'Depot' | 'Initiative' | '' | null
}

const PreviewTile = ({
  latitude = null,
  longitude = null,
  markerIcon = null
}: PreviewTileProps) => (
  <div
    className='preview-map'
    style={{ backgroundImage: tileUrl(latitude, longitude) }}
  >
    <img
      className='preview-marker leaflet-marker-icon'
      src={markerUrl(markerIcon)}
      style={{ display: markerDisplay(markerIcon) }}
      alt='Map Marker Icon'
    />
  </div>
)

export default PreviewTile
