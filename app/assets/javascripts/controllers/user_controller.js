Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  function setAuthToken(authToken) {
    var headerData = { auth_token: authToken };
    $.ajaxSetup({ headers: headerData });
  }

  User.Controller = Backbone.Marionette.Controller.extend({

    initialize: function() {
      this.model = new Teikei.User.Model();
      var loginView = new Teikei.User.LoginView({
        model: this.model,
        controller: this
      });
    },

    login: function(credentials) {
      var model = this.model;
      var loginData = { user: credentials };

      model.save(loginData, {
        success: function(data) {
          setAuthToken(data.auth_token);
        },
        error: function(data) {
          console.log("ERROR", data.toJSON())
        }
      });
    },

  })
})
