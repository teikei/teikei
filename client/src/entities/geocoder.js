Entities.Geocoder = Backbone.Model.extend({

  query: function(city, address) {
    var model = this;
    // reset data to always get the new geocoding results
    this.set("latitude", "");
    this.set("longitude", "");
    this.fetch({
      url: "/api/v1/geocode",
      success: function() {
        model.trigger("geocoder:success");
      },
      error: function(model, xhr) {
        var message = JSON.parse(xhr.responseText);
        model.trigger("geocoder:error", message);
      },
      data: {
        street: address,
        city: city
      }
    });
  }

});
