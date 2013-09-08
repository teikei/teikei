Teikei.module('Places', function(Places, App, Backbone, Marionette, $, _) {

  // Map Model
  // ----------

  Places.Model = Backbone.Model.extend({

    urlRoot: function(){
      var type = this.get("type").toLowerCase();
      var query = "/api/v1/{type}s/";
      return query.replace("{type}", type);
    },

    parse: function (data) {
      if (data && _.isObject(data.place)) {
        return data.place;
      } else {
        return data;
      }
    },

    defaults: {
      name: "",
      type: "",
      farming_standard: "",
      accepts_new_members: "yes",
      address: "",
      city: "",
      contact_email: "",
      contact_funtion: "",
      contact_name: "",
      contact_phone: "",
      contact_url: "http://",
      description: "",
      is_established: true,
      latitude: "",
      longitude: "",
      places: [],
      founded_at_year: "",
      founded_at_month: "",
      maximum_members: null,
      participation: "",
      products: "",
      user_id: null,
      updated_at: null
    },

    toString: function(){
      string = [];
      string.push(this.get("name"));
      string.push(this.get("type"));
      return string.join(", ");
    },

    geocode: function(city, address){
      var model = this;

      // TODO: This should probably not done using fetch, but plain AJAX nstead
      // http://stackoverflow.com/questions/6178369/resolving-model-in-backbone-js-call-set-with-silenttrue-and-trigger-attribu

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
