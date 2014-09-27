Teikei.module("User", function(User, Teikei, Backbone, Marionette, $, _) {

  User.Controller = {

    initializeLoginView: function() {
      User.loginView = new Teikei.User.LoginView({
        model: Teikei.currentUser
      });

      User.loginView.bind("signInForm:submit", User.Controller.signIn, User.Controller);
      User.loginView.bind("signUpForm:submit", User.Controller.signUp, User.Controller);
      User.loginView.bind("signin:tab:click", User.Controller.navigateToSignIn, User.Controller);
      User.loginView.bind("signup:tab:click", User.Controller.navigateToSignUp, User.Controller);
    },

    signInPopup: function() {
      if (!Teikei.currentUser) {
        User.Controller.initializeLoginView();
        Teikei.modalRegion.show(User.loginView);
      }
    },

    signUpPopup: function() {
      if (!Teikei.currentUser) {
        User.Controller.initializeLoginView();
        Teikei.modalRegion.show(User.loginView);
        User.loginView.showSignUpForm();
      }
    },

    navigateToSignIn: function() {
      Backbone.history.navigate('signin');
    },

    navigateToSignUp: function() {
      Backbone.history.navigate('signup');
    },

    signIn: function(credentials) {
      var user = new Teikei.Entities.UserSession();
      user.save({ user: credentials }, {
        success: function(model, response, options) {
          Teikei.currentUser = model;
          Teikei.vent.trigger("user:signin:success", Teikei.currentUser);
        },
        error: function(model, xhr, options) {
          Teikei.vent.trigger("user:signin:fail", xhr);
        }
      });
    },

    signUp: function(credentials) {
      var signUpData = { user: credentials };

      var userSignup = new Teikei.Entities.UserSignup();
      userSignup.save(signUpData, {
        success: function(model, response, options) {
          Teikei.vent.trigger("us" +
            "er:signup:success", model);
        },
        error: function(model, xhr, options) {
          Teikei.vent.trigger("user:signup:fail", xhr);
        }
      });
    },

    logout: function() {
      Teikei.currentUser.destroy({
        success: function(model, response, options) {
          Teikei.currentUser = null;
          Teikei.Alert.Controller.success("Du wurdest erfolgreich abgemeldet!");
          Teikei.vent.trigger("user:logout:success");
        },
        error: function(model, xhr, options) {
          Teikei.Alert.Controller.error("Du konntest nicht abgemeldet werden. Bitte versuche es erneut!");
          Teikei.vent.trigger("user:logout:fail", xhr);
        }
      });
      Backbone.history.navigate('');
    }
  }

  Teikei.vent.on("show:signup", Teikei.signUpPopup, User.Controller);

  User.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      'signin': 'signInPopup',
      'signup': 'signUpPopup',
      'logout': 'logout'
    }
  });

  Teikei.addInitializer(function(){

    User.megaDropView = new User.MegaDropView();
    User.menuView = new User.MenuView({
      model: Teikei.currentUser
    });

    User.menuView.bind("signin:selected", User.Controller.signInPopup, User.Controller);
    User.menuView.bind("signup:selected", User.Controller.signUpPopup, User.Controller);
    User.menuView.bind("logout:selected", User.Controller.logout, User.Controller);
  });

  Teikei.addInitializer(function(){
    new Teikei.User.Router({
      controller: User.Controller
    });
  });
});
