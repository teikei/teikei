import { connect } from 'react-redux'
import { config } from '../App';
import Map from './Map'

const getInitialZoom = () => config.zoom.default

const getApiKey = () => config.apiKey

const mapStateToProps = ({ map }) => ({
  places: map.places,
  highlight: map.highlight,
  bounds: map.position ? undefined : config.defaultBounds,
  position: map.place ? undefined : map.position,
  padding: config.padding,
  currentPlace: map.place || {},
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
