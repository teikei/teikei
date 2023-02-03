import React from 'react'
import PropTypes from 'prop-types'
import { config } from '../../index'

const PREVIEW_TILE_WIDTH = 600
const PREVIEW_TILE_HEIGHT = 240
const PREVIEW_TILE_ZOOM_LEVEL = 14

const tileUrl = (latitude, longitude) => {
  if (!latitude && !longitude) {
    return `url(${config.assetsBaseUrl}/placeimage-placeholder.png)`
  }
  return `url(${config.mapStaticUrl})`
    .replace('{zoom}', PREVIEW_TILE_ZOOM_LEVEL)
    .replace('{width}', PREVIEW_TILE_WIDTH)
    .replace('{height}', PREVIEW_TILE_HEIGHT)
    .replace('{lat}', latitude)
    .replace('{lon}', longitude)
}

const markerUrl = (markerIcon) => {
  if (markerIcon) {
    return `${config.assetsBaseUrl}/marker-${markerIcon.toLowerCase()}.svg`
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
  <div
    className="preview-map"
    style={{ backgroundImage: tileUrl(latitude, longitude) }}
  >
    <img
      className="preview-marker leaflet-marker-icon"
      src={markerUrl(markerIcon)}
      style={{ display: markerDisplay(markerIcon) }}
      alt="Index Marker Icon"
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
