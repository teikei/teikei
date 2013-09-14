Teikei.module('Geocoder', function(Geocoder, App, Backbone, Marionette, $, _) {

  // Geocoder Model
  // ----------

  Geocoder.Model = Backbone.Model.extend({

    query: function(city, address){
      var model = this;
      // reset data to always get the new geocoding results
      this.set("latitude", "");
      this.set("longitude", "");
      this.fetch({
        url: "/api/v1/geocode",
        success: function(){
          model.trigger("geocoder:success");
        },
        data: {
          location: city + "," + address
        }
      });
    }

  });
});
