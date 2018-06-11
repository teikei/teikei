import GeoJSON from 'geojson'

export default type => json => {
  const result = json
  return GeoJSON.parse(result, {
    Point: ['latitude', 'longitude'],
    exclude: ['legacy_id', 'address']
  })
}

export const featureCollection = query => ({
  type: 'FeatureCollection',
  features: query
})
