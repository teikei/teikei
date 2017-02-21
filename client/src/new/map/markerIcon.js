import Leaflet from 'leaflet'

const iconUrl = {
  Depot: '/assets/marker-depot.svg',
  Farm: '/assets/marker-farm.svg',
}

const markerIcon = type => Leaflet.icon({
  shadowUrl: '/assets/marker-shadow.png',
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  shadowSize: [50, 60],
  popupAnchor: [0, 0],
  iconUrl: iconUrl[type],
})

export default markerIcon
