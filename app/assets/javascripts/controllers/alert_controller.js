Teikei.module("Alert", function(Alert, App, Backbone, Marionette, $, _) {

  Alert.Controller = Backbone.Marionette.Controller.extend({

    status: function(message, fadeOut) {
      this._sendFlashMessage({
        message: message,
        fadeOut: fadeOut || true,
        type: ''
      });
    },

    error: function(message, fadeOut) {
      this._sendFlashMessage({
        message: message,
        fadeOut: fadeOut || true,
        type: 'alert'
      });
    },

    success: function(message, fadeOut) {
      this._sendFlashMessage({
        message: message,
        fadeOut: fadeOut || true,
        type: 'success'
      });
    },

    _sendFlashMessage: function(alertData) {
      var model = new Backbone.Model(alertData);
      this.flashMessageView = new Teikei.Alert.FlashMessageView({model: model});
      App.alertRegion.show(this.flashMessageView);
      if (alertData.fadeOut) {
        // fade out after 10 seconds
        setTimeout(function(){
          App.alertRegion.close();
        }, 10000);
      }
    }

  });
});
