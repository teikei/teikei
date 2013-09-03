Teikei.module('Places', function(Places, App, Backbone, Marionette, $, _) {

  // Places Collection
  // ---------------
  Places.Collection = Backbone.Collection.extend({
    url: "/api/v1/places.json",
    model: Teikei.Places.Model,

    byType: function(type) {
      return this._filterBy("type", type);
    },

    byUser: function(userId) {
      return this._filterBy("user_id", userId);
    },

    _filterBy: function(filterAttribute, value) {
      filtered = this.filter(function(place) {
        return place.get(filterAttribute) === value;
      });
      return new Places.Collection(filtered);
    },

    toString: function() {
      string = "";
      this.each(function(place) {
        string += place.toString() + "\n";
      });
      return string;
    }

  });

});
