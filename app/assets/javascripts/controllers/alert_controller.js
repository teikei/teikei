Teikei.module("Alert", function(Alert, App, Backbone, Marionette, $, _) {

  Alert.Controller = Backbone.Marionette.Controller.extend({

    status: function(message) {
      this._sendFlashMessage({
        message: message,
        type: ''
      });
    },

    error: function(message) {
      this._sendFlashMessage({
        message: message,
        type: 'alert'
      });
    },

    success: function(message) {
      this._sendFlashMessage({
        message: message,
        type: 'success'
      });
    },

    _sendFlashMessage: function(alertData) {
      var model = new Backbone.Model(alertData);
      this.flashMessageView = new Teikei.Alert.FlashMessageView({model: model});
      App.alerts.show(this.flashMessageView);
    }

  });
});
