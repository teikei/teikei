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

    initialize: function() {
      this.bindUIElements()
    },

    onFormSubmit: function(event) {
      event.preventDefault();
      var email = this.ui.email.val();
      var password = this.ui.password.val();

      console.log(email, password);
    }

  });
});
