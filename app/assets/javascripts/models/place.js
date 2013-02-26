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
      accepts_new_members: null,
      address: "",
      city: "",
      contact_email: "",
      contact_name: "",
      contact_phone: "",
      description: "",
      is_established: null,
      latitude: "",
      longitude: "",
      name: "",
      places: [],
      type: "",
      farming_standard: "",
      founded_at: "",
      maximum_members: null,
      participation: "",
      products: "",
      user_id: null
    }

  });

});
