Teikei.module("User", function(User, Teikei, Backbone, Marionette, $, _) {

  User.Controller = Backbone.Marionette.Controller.extend({

    initialize: function() {
      this.model = new Teikei.Entities.User();
      this.megaDropView = new Teikei.User.MegaDropView();
      this.menuView = new Teikei.User.MenuView({
        model: this.model
      });

      Teikei.vent.on("show:signup", this.signUpPopup, this);

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
        Teikei.modalRegion.show(this.loginView);
      }
    },

    signUpPopup: function() {
      if (!this.model.tokenIsPresent()) {
        this.initializeLoginView();
        Teikei.modalRegion.show(this.loginView);
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
          Teikei.vent.trigger("user:signin:success", model);
        },
        error: function(model, xhr, options) {
          Teikei.vent.trigger("user:signin:fail", xhr);
        }
      });
    },

    signUp: function(credentials) {
      var signUpData = { user: credentials };

      this.model.signUp(signUpData, {
        success: function(model, response, options) {
          Teikei.vent.trigger("user:signup:success", model);
        },
        error: function(model, xhr, options) {
          Teikei.vent.trigger("user:signup:fail", xhr);
        }
      });
    },

    logout: function() {
      this.model.signOut({
        success: function(model, response, options) {
          model.clear();
          Teikei.alert.success("Du wurdest erfolgreich abgemeldet!");
          Teikei.vent.trigger("user:logout:success");
        },
        error: function(model, xhr, options) {
          Teikei.alert.error("Du konntest nicht abgemeldet werden. Bitte versuche es erneut!");
          Teikei.vent.trigger("user:logout:fail", xhr);
        }
      });
      Backbone.history.navigate('');
    }

  });
});
