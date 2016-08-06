Entities.Places = Backbone.Collection.extend({
  url: '/api/v1/places.json',
  model: Entities.Place,

  byType(type) {
    return this._filterBy('type', type)
  },

  byUserId(userId) {
    const filteredPlaces = []
    this.models.forEach(place => {
      const ownerships = place.get('ownerships')
      _.each(ownerships, ownership => {
        if (ownership && ownership.user_id === userId) {
          filteredPlaces.push(place)
        }
      })
    })
    return new Entities.Places(filteredPlaces)
  },

  _filterBy(filterAttribute, value) {
    const filtered = this.filter(place => {
      return place.get(filterAttribute) === value
    })
    return new Entities.Places(filtered)
  },

  toString() {
    let string = ''
    this.each(place => {
      string += `${place.toString()}
`
    })
    return string
  }

})
