// import React from 'react'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

import Leaflet from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
// import MarkerPopup from './MarkerPopup'
import { MapLayer } from 'react-leaflet'

function initMarker(place) {
  // const icon = new Places.MarkerIcon[type]()
  const location = [place.latitude, place.longitude]
  const marker = L.marker(location, { place })

  return marker
}

class MarkerCluster extends MapLayer {

  createLeafletElement() {
    return Leaflet.markerClusterGroup()
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
