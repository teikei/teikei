/* eslint class-methods-use-this: ["error", { "exceptMethods": ["createLeafletElement"] }] */

import React from 'react'
import { renderToString } from 'react-dom/server'
import Leaflet from 'leaflet'
import { MapLayer } from 'react-leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import markerIcon from './markerIcon'
import PlacePopup from './PlacePopup'
import MarkerClusterIcon from './MarkerClusterIcon'

const BASE_DIAMETER = 70
const FACTOR = 1.1

function initMarker(place) {
  const icon = markerIcon(place.type)
  const popup = renderToString(<PlacePopup place={place} />)
  const location = [place.latitude, place.longitude]

  return Leaflet
    .marker(location, { place, icon })
    .bindPopup(popup)
}

function initClusterIcon(cluster) {
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

class MarkerCluster extends MapLayer {

  createLeafletElement() {
    return Leaflet.markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: initClusterIcon,
    })
  }

  updateLeafletElement(fromProps, toProps) {
    const markers = toProps.places.map(initMarker)
    this.leafletElement.addLayers(markers)

    if (toProps.bounds !== fromProps.bounds) {
      this.leafletElement.setBounds(toProps.bounds)
    }
  }
}

export default MarkerCluster
