Teikei.module('Places', function(Places, App, Backbone, Marionette, $, _) {

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
        this.ui.networkButton.addClass("without-network");
      }
      else {
        this.ui.networkButton.removeClass("without-network");
      }
    }

  });

});
