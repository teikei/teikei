Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  User.Controller = Backbone.Marionette.Controller.extend({

    initialize: function() {
      this.model = new Teikei.User.Model();
      this.megaDropView = new Teikei.User.MegaDropView();
      this.menuView = new Teikei.User.MenuView({
        model: this.model
      });

      App.vent.on("show:signup", this.signUpPopup, this);

      this.menuView.bind("signin:selected", this.signInPopup, this);
      this.menuView.bind("signup:selected", this.signUpPopup, this);
      this.menuView.bind("logout:selected", this.logout, this);
    },

    initializeLoginView: function() {
      this.loginView = new Teikei.User.LoginView({
        model: this.model
      });

      this.loginView.bind("signInForm:submit", this.signIn, this);
      this.loginView.bind("signUpForm:submit", this.signUp, this);
      this.loginView.bind("signin:tab:click", this.navigateToSignIn, this);
      this.loginView.bind("signup:tab:click", this.navigateToSignUp, this);
    },

    signInPopup: function() {
      if (!this.model.tokenIsPresent()) {
        this.initializeLoginView();
        App.modalRegion.show(this.loginView);
      }
    },

    signUpPopup: function() {
      if (!this.model.tokenIsPresent()) {
        this.initializeLoginView();
        App.modalRegion.show(this.loginView);
        this.loginView.showSignUpForm();
      }
    },

    navigateToSignIn: function() {
      Backbone.history.navigate('signin');
    },

    navigateToSignUp: function() {
      Backbone.history.navigate('signup');
    },

    signIn: function(credentials) {
      var signInData = { user: credentials };

      this.model.signIn(signInData, {
        success: function(model, response, options) {
          App.vent.trigger("user:signin:success", model);
        },
        error: function(model, xhr, options) {
          App.vent.trigger("user:signin:fail", xhr);
        }
      });
    },

    signUp: function(credentials) {
      var signUpData = { user: credentials };

      this.model.signUp(signUpData, {
        success: function(model, response, options) {
          App.vent.trigger("user:signup:success", model);
        },
        error: function(model, xhr, options) {
          App.vent.trigger("user:signup:fail", xhr);
        }
      });
    },

    logout: function() {
      this.model.signOut({
        success: function(model, response, options) {
          model.clear();
          App.alert.success("Du wurdest erfolgreich abgemeldet!");
          App.vent.trigger("user:logout:success");
        },
        error: function(model, xhr, options) {
          App.alert.error("Du konntest nicht abgemeldet werden. Bitte versuche es erneut!");
          App.vent.trigger("user:logout:fail", xhr);
        }
      });
      Backbone.history.navigate('logout');
    }

  });
});
