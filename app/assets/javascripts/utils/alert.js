Teikei.module("Alert", function(Alert, Teikei, Backbone, Marionette, $, _) {

  Alert.renderSignUpStatus = function(model) {
    Alert.renderStatus(model, "user/alerts/signup-success", false);
  };

  Alert.renderSignInSuccess = function(model) {
    Alert.renderSuccess(model, "user/alerts/signin-success", true);
  };

  Alert.renderPlaceCreateSuccess = function(model) {
    Alert.renderSuccess(model, "places/alerts/create-success", true);
  };

  Alert.renderPlaceDeleteSuccess = function(model) {
    Alert.renderSuccess(model, "places/alerts/delete-success", true);
  };

  Alert.renderPlaceDeleteFailure = function(model) {
    Alert.renderError(model, "places/alerts/delete-failure", false);
  };

  // Helper

  Alert.renderStatus = function(model, template) {
    var serializedModel = model.toJSON();
    var message = Marionette.Renderer.render(template, serializedModel);
    alertify.log(message, "standard", null, null);
  };

  Alert.renderSuccess = function(model, template) {
    var serializedModel = model.toJSON();
    var message = Marionette.Renderer.render(template, serializedModel);
    alertify.log(message, "success", null, null);
  };

  Alert.renderError = function(model, template) {
    var serializedModel = model.toJSON();
    var message = Marionette.Renderer.render(template, serializedModel);
    alertify.log(message, "error", null, null);
  };

});
