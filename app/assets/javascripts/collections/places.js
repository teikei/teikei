Teikei.module('Places', function(Places, App, Backbone, Marionette, $, _) {

  // Places Collection
  // ---------------
  Places.Collection = Backbone.Collection.extend({
    url: "/api/v1/places.json",
    model: Teikei.Places.Model
  });

});
