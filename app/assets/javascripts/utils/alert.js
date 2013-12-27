Teikei.module("Alert", function(Alert, App, Backbone, Marionette, $, _) {

  Alert.renderSignUpStatus = function(model) {
    Alert.renderStatus(model, "user/alerts/signup-success", false);
  };

  Alert.renderSignInSuccess = function(model) {
    Alert.renderSuccess(model, "user/alerts/signin-success", true);
  };

  Alert.renderPlaceCreateSuccess = function(model) {
    Alert.renderSuccess(model, "places/alerts/create-success", true);
  };

  // Helper

  Alert.renderStatus = function(model, template, fadeOut) {
    var serializedModel = model.toJSON();
    var message = Marionette.Renderer.render(template, serializedModel);
    App.alert.status(message, fadeOut);
  };

  Alert.renderSuccess = function(model, template, fadeOut) {
    var serializedModel = model.toJSON();
    var message = Marionette.Renderer.render(template, serializedModel);
    App.alert.success(message, fadeOut);
  };

});
