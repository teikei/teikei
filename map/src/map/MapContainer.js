import { connect } from 'react-redux'
import config from '../configuration'
import MapComponent from './MapComponent'

const mapStateToProps = ({ map, details }) => ({
  places: map.places,
  data: map.data,
  position: map.position,
  padding: config.padding,
  currentPlace: details.place || {},
  zoom: map.zoom,
  minZoom: config.zoom.min,
  maxZoom: config.zoom.max,
  apiKey: config.apiKey,
  showInfo: map.showInfo
})

const mapDispatchToProps = () => ({})

const MapContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MapComponent)

export default MapContainer
