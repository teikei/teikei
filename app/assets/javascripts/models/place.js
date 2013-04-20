Teikei.module('Places', function(Places, App, Backbone, Marionette, $, _) {

  // Map Model
  // ----------

  Places.Model = Backbone.Model.extend({

    urlRoot: function(){
      var type = this.get("type").toLowerCase();
      var query = "/api/v1/{type}s/";
      return query.replace("{type}", type);
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
      founded_at: "",
      maximum_members: null,
      participation: "",
      products: "",
      user_id: null
    },

    geocode: function(city, address, callback){
      this.fetch({
        url: "/api/v1/geocode",
        success: function(data) {
          console.log(data, "!!!!");
          callback(data);
        },
        data: {
          location: city + "," + address
        }
      });
    }

  });

});
