/* eslint class-methods-use-this: ["error", { "exceptMethods": ["createLeafletElement"] }] */

import find from 'lodash.find'
import defer from 'lodash.defer'
import React from 'react'
import { renderToString } from 'react-dom/server'
import Leaflet from 'leaflet'
import { MapLayer } from 'react-leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import markerIcon from './markerIcon'
import PlacePopup from './PlacePopup'
import MarkerClusterIcon from './MarkerClusterIcon'
import config from '../configuration'
import featureToPlace from '../common/migrationUtils'

const BASE_DIAMETER = 70
const FACTOR = 1.1

export const initMarker = (feature, latlng) => {
  const icon = markerIcon(feature.properties.type)
  const popup = renderToString(<PlacePopup place={featureToPlace(feature)} />)

  return Leaflet.marker(latlng, { feature, icon }).bindPopup(popup, {
    autoPanPaddingTopLeft: config.padding
  })
}

export const initClusterIcon = cluster => {
  const markers = cluster.getAllChildMarkers()
  const features = markers.map(m => m.feature)

  const diameter = features.length * FACTOR + BASE_DIAMETER

  return Leaflet.divIcon({
    className: 'cluster',
    iconSize: Leaflet.point(diameter, diameter),
    html: renderToString(<MarkerClusterIcon features={features} />)
  })
}

const initFocusPopup = (placeName, location, state) =>
  Leaflet.popup({
    className: 'focus-popup',
    offset: [0, -50],
    autoPanPaddingTopLeft: state.paddingTopLeft,
    autoPanPaddingBottomRight: state.paddingBottomRight,
    closeButton: false,
    closeOnClick: false
  })
    .setLatLng(location)
    .setContent(placeName)

class MarkerCluster extends MapLayer {
  constructor(props) {
    super(props)
    this.state = {}
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
  }

  componentDidMount() {
    super.componentDidMount()
    this.updateWindowDimensions()
    window.addEventListener('resize', this.updateWindowDimensions.bind(this))
  }

  componentWillUnmount() {
    super.componentWillUnmount()
    window.removeEventListener('resize', this.updateWindowDimensions.bind(this))
  }

  createLeafletElement({ entries }) {
    const leafletElement = Leaflet.markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: initClusterIcon
    })
    return entries.type
      ? leafletElement.addLayers(Leaflet.geoJson(entries))
      : leafletElement.addLayers()
  }

  updateLeafletElement(fromProps, { places, highlight }) {
    this.markers = places.map(initMarker)
    this.leafletElement.clearLayers()
    this.leafletElement.addLayers(this.markers)
    this.setFocus(highlight)
  }

  updateWindowDimensions = () => {
    const width = window.innerWidth
    const height = window.innerHeight

    this.setState({
      paddingTopLeft: [width * 0.75, height * 0.5],
      paddingBottomRight: [width * 0.2, height * 0.2]
    })
  }

  setFocus = focusId => {
    const { map } = this.context
    const focusMarker = find(
      this.markers,
      ({ options }) => options.place.id === focusId
    )

    if (this.focusPopup) {
      map.removeLayer(this.focusPopup)
      map.scrollWheelZoom.enable()
    }

    if (focusMarker) {
      map.scrollWheelZoom.disable()
      const placeName = focusMarker.options.place.name
      const location = focusMarker.getLatLng()
      this.focusPopup = initFocusPopup(placeName, location, this.state)
      defer(() => map.addLayer(this.focusPopup))
    } else {
      map.scrollWheelZoom.enable()
    }
  }
}

export default MarkerCluster
