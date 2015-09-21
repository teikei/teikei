User = {};

require('./views/login');
require('./views/menu');

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
    var user = new Entities.UserSession();
    user.save({user: credentials}, {
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
    var signUpData = {user: credentials};

    var userSignup = new Entities.UserSignup();
    userSignup.save(signUpData, {
      success: function(model, response, options) {
        Teikei.vent.trigger("user:signup:success", model);
      },
      error: function(model, xhr, options) {
        Teikei.vent.trigger("user:signup:fail", xhr);
      }
    });
  }
};

Teikei.vent.on("show:signup", Teikei.signUpPopup, User.Controller);

User.Router = Backbone.Marionette.AppRouter.extend({
  appRoutes: {
    'signin': 'signInPopup',
    'signup': 'signUpPopup'
  }
});

Teikei.addInitializer(function() {
  User.menuView = new User.MenuView({
    model: Teikei.currentUser
  });

  User.menuView.bind("signin:selected", User.Controller.signInPopup, User.Controller);
  User.menuView.bind("signup:selected", User.Controller.signUpPopup, User.Controller);
});

Teikei.addInitializer(function() {
  new User.Router({
    controller: User.Controller
  });
});
