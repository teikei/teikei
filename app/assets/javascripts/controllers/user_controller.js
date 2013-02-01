Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  var

  User.Controller = Backbone.Marionette.Controller.extend({

    initialize: function() {
      this.model = new Teikei.User.Model();
      var loginView = new Teikei.User.LoginView({
        model: model,
        controller: this
      });
    },

    login: function(email, password) {
      //post to the API
    }

  })
})
