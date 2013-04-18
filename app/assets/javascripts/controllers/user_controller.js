Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  User.Controller = Backbone.Marionette.Controller.extend({

    initialize: function() {
      this.model = new Teikei.User.Model();
      this.menuView = new Teikei.User.MenuView(this);
      this.megaDropView = new Teikei.User.MegaDropView();
      this.loginView = new Teikei.User.LoginView(this);

      this.menuView.bind("signin:selected", this.loginPopup, this);
      this.menuView.bind("logout:selected", this.logout, this);
      this.loginView.bind("signInForm:submit", this.signIn, this);
      this.loginView.bind("signUpForm:submit", this.signUp, this);

      App.userPopup.show(this.loginView);
    },

    loginPopup: function() {
      this.loginView.showForm();
      Backbone.history.navigate('signin');
    },

    signIn: function(credentials) {
      var model = this.model;
      var loginData = { user: credentials };

      model.save(loginData, {
        success: function(data) {
          App.vent.trigger("user:signin:success");
        },
        error: function(data) {
          App.vent.trigger("user:signin:fail");
        }
      });
    },

    signUp: function(credentials) {
      var model = this.model;
      var signUpData = { user: credentials };

      model.signUp(signUpData, {
        success: function(model, response, options) {
          alert("SignUp successful.");
        },
        error: function(model, xhr, options) {
          alert("SignUp failure. Status = " + xhr.status + ".");
        }
      });
    },

    logout: function() {
      var model = this.model;

      model.destroy({
        wait: true,
        success: function(data) {
          model.clear();
          App.vent.trigger("user:logout:success");
        },
        error: function(data) {
          App.vent.trigger("user:logout:fail");
        }
      });
      Backbone.history.navigate('logout');
    }

  });
});
