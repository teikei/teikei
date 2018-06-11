import GeoJSON from 'geojson'

export default json =>
  GeoJSON.parse(json, {
    Point: ['latitude', 'longitude'],
    exclude: ['legacyId', 'address']
  })

export const featureCollection = query => ({
  type: 'FeatureCollection',
  features: query
})
