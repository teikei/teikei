Teikei.module('Places', function(Places, App, Backbone, Marionette, $, _) {

  Places.MapItemView = Marionette.ItemView.extend({

    triggers: {
      "click button.details": "select:details",
      "click button.network": "select:network"
    },

    template: 'places/map_item',
    templateHelpers: Teikei.templateHelpers

  });

});
