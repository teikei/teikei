Teikei.module("Alert", function(Alert, Teikei, Backbone, Marionette, $, _) {

  Alert.FlashMessageView = Marionette.ItemView.extend({

    template: "alert/flash_message",

    ui: {
    },

    events: {
    },

    initialize: function(options) {
      this.model = options.model;
    }

  });

});
