Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  function setAuthToken(authToken) {
    var headerData = { auth_token: authToken };
    $.ajaxSetup({ headers: headerData });
  }

  User.Controller = Backbone.Marionette.Controller.extend({

    initialize: function() {
      this.model = new Teikei.User.Model();
      this.menuView = new Teikei.User.MenuView(this);
      this.loginView = new Teikei.User.LoginView(this);
      App.popupRegion.show(this.loginView);
    },

    loginPopup: function() {
      this.loginView.open();
    },

    login: function(credentials) {
      var model = this.model;
      var loginData = { user: credentials };

      model.save(loginData, {
        success: function(data) {
          setAuthToken(data.auth_token);
          model.set("loggedIn", true);
          App.vent.trigger("user:login:success");
        },
        error: function(data) {
          App.vent.trigger("user:login:fail");
        }
      });
    },

    logout: function() {
      var model = this.model;
      model.destroy({
        success: function(data) {
          setAuthToken(null);
          model.set("loggedIn", false);
          App.vent.trigger("user:logout:success");
        },
        error: function(data) {
          App.vent.trigger("user:logout:fail");
        }
      });
    }

  })
})
