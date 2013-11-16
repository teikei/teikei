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
      accepts_new_members: "yes",
      address: "",
      city: "",
      contact_email: "",
      contact_funtion: "",
      contact_name: "",
      contact_phone: "",
      contact_url: "",
      description: "",
      is_established: true,
      latitude: "",
      longitude: "",
      places: [],
      founded_at_year: "",
      founded_at_month: "",
      maximum_members: null,
      participation: "",
      acts_ecological: false,
      economical_behavior: "",
      vegetable_products: "",
      animal_products: "",
      beverages: "",
      additional_product_information: "",
      user_id: null,
      updated_at: null
    },

    toString: function(){
      string = [];
      string.push(this.get("name"));
      string.push(this.get("type"));
      return string.join(", ");
    }
  });
});
