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

    initialize: function() {
      this.updateNetworkButton();
      Marionette.ItemView.prototype.initialize.apply(this, arguments);
    },

    updateNetworkButton: function() {
      if (this.model === undefined) {
        return;
      }
      var self = this;
      this.model.fetch({
        reset: true,
        success: function(model, response, options) {
          var places = model.get("places");
          if (places === undefined || places.length < 1) {
            self.ui.networkButton.addClass("without-network");
          }
          else {
            self.ui.networkButton.removeClass("without-network");
          }
        }
      });
    }

  });

});
