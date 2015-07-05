Teikei.module('Entities', function(Entities, Teikei, Backbone, Marionette, $, _) {

  Entities.Places = Backbone.Collection.extend({
    url: "/api/v1/places.json",
    model: Entities.Place,

    byType: function(type) {
      return this._filterBy("type", type);
    },

    byUserId: function(userId) {
      var filteredPlaces = [];
      this.models.forEach(function(place){
        var ownerships = place.get("ownerships");
        _.each(ownerships, function(ownership) {
          if (ownership && ownership.user_id === userId) {
            filteredPlaces.push(place);
          }
        });
      });
      return new Entities.Places(filteredPlaces);
    },

    _filterBy: function(filterAttribute, value) {
      filtered = this.filter(function(place) {
        return place.get(filterAttribute) === value;
      });
      return new Entities.Places(filtered);
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
