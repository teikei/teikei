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
      places: [],
      founded_at: "",
      maximum_members: null,
      participation: "",
      products: "",
      user_id: null
    }

  });

});
