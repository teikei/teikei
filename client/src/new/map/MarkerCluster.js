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

const BASE_DIAMETER = 70
const FACTOR = 1.1

const initMarker = (place) => {
  const icon = markerIcon(place.type)
  const popup = renderToString(<PlacePopup place={place} />)
  const location = [place.latitude, place.longitude]

  return Leaflet.marker(location, { place, icon })
    .bindPopup(popup, { autoPanPaddingTopLeft: config.padding })
}

const initClusterIcon = (cluster) => {
  const markers = cluster.getAllChildMarkers()
  const places = markers.map(({ options }) => options.place)
  const diameter = (places.length * FACTOR) + BASE_DIAMETER

  return Leaflet.divIcon({
    className: 'cluster',
    iconSize: Leaflet.point(diameter, diameter),
    html: renderToString(
      <MarkerClusterIcon places={places} />,
    ),
  })
}

const initFocusPopup = (placeName, location) => {
  return Leaflet.popup({
    className: 'focus-popup',
    offset: [0, -50],
    autoPanPaddingTopLeft: [850, 300],
    autoPanPaddingBottomRight: [100, 300],
    closeButton: false,
    closeOnClick: false,
  })
    .setLatLng(location)
    .setContent(placeName)
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

  updateLeafletElement(fromProps, { places, highlight }) {
    this.markers = places.map(initMarker)
    this.leafletElement.clearLayers()
    this.leafletElement.addLayers(this.markers)
    this.setFocus(highlight)
  }

  setFocus = (focusId) => {
    const map = this.context.map
    const focusMarker = find(this.markers, ({ options }) => (
      options.place.id === focusId
    ))

    if (this.focusPopup) {
      map.removeLayer(this.focusPopup)
      map.scrollWheelZoom.enable();
    }

    if (focusMarker) {
      map.scrollWheelZoom.disable();
      const placeName = focusMarker.options.place.name
      const location = focusMarker.getLatLng()
      this.focusPopup = initFocusPopup(placeName, location)
      defer(() => map.addLayer(this.focusPopup))
    } else {
      map.scrollWheelZoom.enable();
    }
  }
}

export default MarkerCluster
