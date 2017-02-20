Entities.Geocoder = Backbone.Model.extend({

  query(city, address) {
    const model = this
    // reset data to always get the new geocoding results
    this.set('latitude', '')
    this.set('longitude', '')
    this.fetch({
      url: '/api/v1/geocode/search/structured',
      success() {
        model.trigger('geocoder:success')
      },
      error(model, xhr) {
        const message = JSON.parse(xhr.responseText)
        model.trigger('geocoder:error', message)
      },
      data: {
        address: address,
        locality: city
      }
    })
  },
  parse(response, options) {
    if (response.length >= 1){
      this.set('latitude', response[0].lat)
      this.set('longitude', response[0].lon)
    }
    else {
      this.set('latitude', '')
      this.set('longitude', '')
    }
  }

})

