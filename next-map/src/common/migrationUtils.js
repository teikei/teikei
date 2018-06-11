export default feature =>
  feature
    ? Object.assign(feature.properties, {
        longitude: feature.geometry.coordinates[0].toString(),
        latitude: feature.geometry.coordinates[1].toString()
      })
    : null
