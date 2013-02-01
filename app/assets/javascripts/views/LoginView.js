Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  User.LoginView = Marionette.View.extend({

    el: "#login",

    ui: {
      email: "#login-email",
      password: "#login-password"
    },

    events: {
      "submit form": "onFormSubmit"
    },

    initialize: function(options) {
      this.bindUIElements()
      this.controller = options.controller;
      this.model = options.model;
    },

    onFormSubmit: function(event) {
      event.preventDefault();
      this.controller.login({
        email: this.ui.email.val(),
        password: this.ui.password.val()
      });
    }

  });
});
