const featureToPlace = feature => {
  const place = feature
    ? Object.assign(feature.properties, {
        longitude: feature.geometry.coordinates[0].toString(),
        latitude: feature.geometry.coordinates[1].toString()
      })
    : null

  if (place && place.places) {
    place.places = place.places.map(featureToPlace)
  }
  return place
}

export default featureToPlace
