import { connect } from 'react-redux'
import config from '../configuration'
import Map from './Map'

const mapStateToProps = ({ map }) => ({
  places: map.places,
  highlight: map.highlight,
  bounds: map.position ? undefined : config.defaultBounds,
  position: map.position,
  padding: config.padding,
  currentPlace: map.place || {},
  zoom: map.zoom || config.zoom.default,
  apiKey:config.apiKey,
})

const mapDispatchToProps = () => ({
})

const MapContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Map)

export default MapContainer
