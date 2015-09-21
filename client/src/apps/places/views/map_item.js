Places.MapItemView = Marionette.ItemView.extend({

  triggers: {
    "click button.details": "select:details",
    "click button.network": "select:network"
  },

  template: 'places/map_item',

  templateHelpers: function() {
    return {
      translatedProducts: function() {
        return _.union(this.animal_products,
          this.vegetable_products,
          this.beverages).filter(function(p) {
            return p !== null;
          }).map(function(p) {
            return I18n.t('products.' + p);
          }).join(', ');
      }
    };
  },

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
