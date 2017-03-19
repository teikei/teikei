import { connect } from 'react-redux'
import config from '../configuration'
import MapComponent from './MapComponent'

const mapStateToProps = ({ map }) => ({
  places: map.places,
  highlight: map.highlight,
  position: map.position,
  padding: config.padding,
  currentPlace: map.place || {},
  zoom: map.zoom || config.zoom.default,
  apiKey: config.apiKey,
})

const mapDispatchToProps = () => ({
})

const MapContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapComponent)

export default MapContainer
