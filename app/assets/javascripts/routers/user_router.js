Teikei.module("User", function(User, Teikei, Backbone, Marionette, $, _) {

  User.Router = Backbone.Marionette.AppRouter.extend({

    appRoutes: {
      'signin': 'signInPopup',
      'signup': 'signUpPopup',
      'logout': 'logout'
    },

  });

});
