import { connect } from 'react-redux'
import { config } from '../App';
import Map from './Map'

const getInitialPosition = () => {
  const center = config.center
  return [center.lat, center.lon]
}

const getInitialZoom = () => config.zoom.default

const getApiKey = () => config.apiKey

const mapStateToProps = ({ map }) => ({
  places: map.places,
  highlight: map.highlight,
  bounds: config.defaultBounds,
  padding: config.padding,
  position: map.position || getInitialPosition(),
  zoom: map.zoom || getInitialZoom(),
  apiKey: getApiKey(),
})

const mapDispatchToProps = () => ({
})

const MapContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Map)

export default MapContainer
