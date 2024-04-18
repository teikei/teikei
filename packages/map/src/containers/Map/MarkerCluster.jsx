import React from "react"
import { renderToString } from "react-dom/server"
import Leaflet from "leaflet"
import markerIcon from "./markerIcon"
import PlacePopup from "./PlacePopup"
import MarkerClusterIcon from "./MarkerClusterIcon"
import { config } from "../../main"

const BASE_DIAMETER = 70
const FACTOR = 1.1

export const initMarker = (feature, latlng) => {
  const icon = markerIcon(feature.properties.type)
  const popup = renderToString(<PlacePopup feature={feature} />)

  return Leaflet.marker(latlng, { feature, icon }).bindPopup(popup, {
    autoPanPaddingTopLeft: config.padding,
  })
}

export const initClusterIcon = (cluster) => {
  const markers = cluster.getAllChildMarkers()
  const features = markers.map((m) => m.feature)

  const diameter = features.length * FACTOR + BASE_DIAMETER

  return Leaflet.divIcon({
    className: "cluster",
    iconSize: Leaflet.point(diameter, diameter),
    html: renderToString(<MarkerClusterIcon features={features} />),
  })
}
