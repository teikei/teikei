Teikei.module("Alert", function(Alert, App, Backbone, Marionette, $, _) {

  Alert.Controller = Backbone.Marionette.Controller.extend({

    flashMessage: function(message, type) {
      var model = new Backbone.Model({
        message: message,
        type: type
      });
      this.flashMessageView = new Teikei.Alert.FlashMessageView({model: model});
      App.alerts.show(this.flashMessageView);
    }

  });
});
