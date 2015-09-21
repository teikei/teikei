var BASE_DIAMETER = 70;
var FACTOR = 1.1;

Places.MarkerCluster = Marionette.ItemView.extend({

  template: "places/marker_cluster",

  initialize: function(options) {
    models = _.pluck(options.markers, "model");
    counters = _.countBy(models, function(model) {
      return model.get("type").toLowerCase();
    });

    this.model = new Backbone.Model({
      farms: counters.farm,
      depots: counters.depot,
      sum: models.length
    });

    this.render();
  },

  getLeafletIcon: function() {
    sum = this.model.get('sum');
    diameter = sum * FACTOR + BASE_DIAMETER;

    return L.divIcon({
      html: this.el.innerHTML,
      className: "cluster",
      iconSize: L.point(diameter, diameter)
    });
  }

});

