import React, { PropTypes } from 'react'
import conf from '../configuration'

const PREVIEW_TILE_WIDTH = 600
const PREVIEW_TILE_HEIGHT = 240
const PREVIEW_TILE_ZOOM_LEVEL = 14

const tileUrl = (latitude, longitude) => {
  if (!latitude && !longitude) {
    return `url(${conf.assetsBaseUrl}/placeimage-placeholder.png)`
  }
  return 'url(//api.tiles.mapbox.com/v3/{APIKEY}/{LNG},{LAT},{ZOOM}/{WIDTH}x{HEIGHT}.png)'
    .replace('{APIKEY}', conf.apiKey)
    .replace('{ZOOM}', PREVIEW_TILE_ZOOM_LEVEL)
    .replace('{WIDTH}', PREVIEW_TILE_WIDTH)
    .replace('{HEIGHT}', PREVIEW_TILE_HEIGHT)
    .replace('{LAT}', latitude)
    .replace('{LNG}', longitude)
}

const markerUrl = (markerIcon) => {
  if (markerIcon) {
    return `${conf.assetsBaseUrl}/marker-${markerIcon.toLowerCase()}.svg`
  }
  return ''
}

const markerDisplay = (markerIcon) => {
  if (markerIcon) {
    return 'block'
  }
  return 'none'
}

const PreviewTile = ({ latitude, longitude, markerIcon }) => (
  <div className="preview-map" style={{ backgroundImage: tileUrl(latitude, longitude) }}>
    <img
      className="preview-marker leaflet-marker-icon"
      src={markerUrl(markerIcon)}
      style={{ display: markerDisplay(markerIcon) }}
      alt="Map Marker Icon"
    />
  </div>
)

PreviewTile.propTypes = {
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  markerIcon: PropTypes.oneOf(['Farm', 'Depot', 'Initiative', '']),
}

PreviewTile.defaultProps = {
  latitude: null,
  longitude: null,
  markerIcon: null,
}

export default PreviewTile
