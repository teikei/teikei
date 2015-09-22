Entities.Place = Backbone.Model.extend({

  urlRoot: function() {
    var type = this.get("type").toLowerCase();
    var query = "/api/v1/{type}s/";
    return query.replace("{type}", type);
  },

  parse: function(data) {
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
    contact_function: "",
    url: "",
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
    related_places_count: 0,
    delivery_days: "",
    ownerships: [],
    updated_at: null,
    image: {
      url: "",
      thumbnail_url: "",
      description: null,
      contact_by_email: false,
      contact_by_phone: false
    }
  },

  toString: function() {
    var string = [];
    string.push(this.get("name"));
    string.push(this.get("type"));
    return string.join(", ");
  }
});
