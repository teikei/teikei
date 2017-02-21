/* eslint class-methods-use-this: ["error", { "exceptMethods": ["createLeafletElement"] }] */

import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Leaflet from 'leaflet'
import { MapLayer } from 'react-leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import MarkerClusterIcon from './MarkerClusterIcon'

const BASE_DIAMETER = 70
const FACTOR = 1.1

function initMarker(place) {
  // const icon = new Places.MarkerIcon[type]()
  const location = [place.latitude, place.longitude]
  const marker = L.marker(location, { place })
  return marker
}

function initClusterIcon(cluster) {
  const markers = cluster.getAllChildMarkers()
  const places = markers.map(m => m.options.place)
  const diameter = (places.length * FACTOR) + BASE_DIAMETER

  const clusterView = Leaflet.divIcon({
    className: 'cluster',
    iconSize: Leaflet.point(diameter, diameter),
    html: ReactDOMServer.renderToStaticMarkup(
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
