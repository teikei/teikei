Teikei.module('Places', function(Places, App, Backbone, Marionette, $, _) {

  // Places Collection
  // ---------------
  Places.Collection = Backbone.Collection.extend({
    url: "/api/v1/places.json",
    model: Teikei.Places.Model,

    byType: function(type) {
      filtered = this.filter(function(place) {
        return place.get("type") === type;
        });
      return new Places.Collection(filtered);
    }
  });

});
