import { connect } from 'react-redux'
import config from '../configuration'
import MapComponent from './MapComponent'

const featureToPlace = feature => (feature ? feature.properties : null)

const mapStateToProps = ({
  map,
  // details,
  entries,
  depots,
  farms,
  initiatives
}) => ({
  places: map.places,
  highlight: map.highlight,
  position: map.position,
  padding: config.padding,
  currentPlace:
    featureToPlace(depots.data) ||
    featureToPlace(farms.data) ||
    featureToPlace(initiatives.data),
  zoom: map.zoom || config.zoom.default,
  minZoom: config.zoom.min,
  maxZoom: config.zoom.max,
  apiKey: config.apiKey,
  showInfo: map.showInfo,
  entries
})

const mapDispatchToProps = () => ({})

const MapContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MapComponent)

export default MapContainer
