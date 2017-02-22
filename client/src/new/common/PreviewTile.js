import React from 'react'
import conf from '../../configuration'

const PREVIEW_TILE_WIDTH = 600
const PREVIEW_TILE_HEIGHT = 240
const PREVIEW_TILE_ZOOM_LEVEL = 14

const tileUrl = (latitude, longitude) => {
  if (!latitude && !longitude) {
    return 'url(/assets/placeimage-placeholder.png)'
  }
  return 'url(//api.tiles.mapbox.com/v3/{APIKEY}/{LNG},{LAT},{ZOOM}/{WIDTH}x{HEIGHT}.png)'
    .replace('{APIKEY}', conf.apiKey)
    .replace('{ZOOM}', PREVIEW_TILE_ZOOM_LEVEL)
    .replace('{WIDTH}', PREVIEW_TILE_WIDTH)
    .replace('{HEIGHT}', PREVIEW_TILE_HEIGHT)
    .replace('{LAT}', latitude)
    .replace('{LNG}', longitude)
}

const PreviewTile = ({ latitude, longitude, markerIcon }) => (
  <div className="preview-map" style={{ backgroundImage: tileUrl(latitude, longitude) }}>
    <img
      className="preview-marker leaflet-marker-icon"
      src={`/assets/marker-${markerIcon.toLowerCase()}.svg`}
      style={{ display: 'block' }}
    />
  </div>
)

PreviewTile.propTypes = {
  latitude: React.PropTypes.string.isRequired,
  longitude: React.PropTypes.string.isRequired,
  markerIcon: React.PropTypes.oneOf(['Farm', 'Depot']).isRequired,
}

export default PreviewTile
