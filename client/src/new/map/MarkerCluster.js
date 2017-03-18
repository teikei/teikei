/* eslint class-methods-use-this: ["error", { "exceptMethods": ["createLeafletElement"] }] */

import find from 'lodash.find'
import React from 'react'
import { renderToString } from 'react-dom/server'
import isEqual from 'lodash.isequal'
import Leaflet from 'leaflet'
import { MapLayer } from 'react-leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import markerIcon from './markerIcon'
import PlacePopup from './PlacePopup'
import MarkerClusterIcon from './MarkerClusterIcon'
import config from '../configuration'

const BASE_DIAMETER = 70
const FACTOR = 1.1

const initMarker = (place) => {
  const icon = markerIcon(place.type)
  const popup = renderToString(<PlacePopup place={place} />)
  const location = [place.latitude, place.longitude]

  return Leaflet
    .marker(location, { place, icon })
    .bindPopup(popup, { autoPanPaddingTopLeft: config.padding })
}

const initClusterIcon = (cluster) => {
  const markers = cluster.getAllChildMarkers()
  const places = markers.map(m => m.options.place)
  const diameter = (places.length * FACTOR) + BASE_DIAMETER

  const clusterView = Leaflet.divIcon({
    className: 'cluster',
    iconSize: Leaflet.point(diameter, diameter),
    html: renderToString(
      <MarkerClusterIcon places={places} />,
    ),
  })
  return clusterView
}

const setFocus = (leafletElement, markers, focusId) => {
  const focusMarker = find(markers, ({ options }) => (
    options.place.id === focusId
  ))

  if (focusMarker) {
    leafletElement.zoomToShowLayer(focusMarker, () => {
      focusMarker.openPopup();
    })
  }
}

class MarkerCluster extends MapLayer {

  createLeafletElement({ places }) {
    const leafletElement = Leaflet.markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: initClusterIcon,
    })
    this.markers = places.map(initMarker)
    return leafletElement.addLayers(this.markers)
  }

  updateLeafletElement(fromProps, { places }) {
    this.markers = places.map(initMarker)
    this.leafletElement.clearLayers()
    this.leafletElement.addLayers(this.markers)
  }

  componentDidMount() {
    super.componentDidMount()
    setFocus(this.leafletElement, this.markers, this.props.highlight)
  }

  componentDidUpdate(props) {
    super.componentDidUpdate(props)
    setFocus(this.leafletElement, this.markers, this.props.highlight)
  }

  shouldComponentUpdate({ places, highlight }) {
    const placesHaveUpdated = !isEqual(this.props.places, places)
    const highlightHasUpdated = !isEqual(this.props.highlight, highlight)
    return placesHaveUpdated || highlightHasUpdated
  }

}

export default MarkerCluster
