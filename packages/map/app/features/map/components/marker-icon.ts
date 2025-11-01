import Leaflet from 'leaflet'
import config from '~/config/app-configuration'

const iconUrl = () => ({
  Depot: `${config.assetsBaseUrl}/marker-depot.svg`,
  Farm: `${config.assetsBaseUrl}/marker-farm.svg`,
  Initiative: `${config.assetsBaseUrl}/marker-initiative.svg`
})

const markerIcon = (type: 'Depot' | 'Farm' | 'Initiative') =>
  Leaflet.icon({
    shadowUrl: `${config.assetsBaseUrl}/marker-shadow.png`,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    shadowSize: [50, 60],
    popupAnchor: [0, -50],
    iconUrl: iconUrl()[type]
  })

export default markerIcon
