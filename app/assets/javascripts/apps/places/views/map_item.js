Teikei.module('Places', function(Places, Teikei, Backbone, Marionette, $, _) {

  Places.MapItemView = Marionette.ItemView.extend({

    triggers: {
      "click button.details": "select:details",
      "click button.network": "select:network"
    },

    template: 'places/map_item',

    ui: {
      networkButton: ".network"
    },

    onRender: function() {
      this.updateNetworkButton();
    },

    updateNetworkButton: function() {
      if (this.model === undefined) {
        return;
      }
      if (this.model.get("related_places_count") < 1) {
        this.ui.networkButton.attr('disabled', true);
      }
      else {
        this.ui.networkButton.attr('disabled', false);
      }
    }

  });

});
