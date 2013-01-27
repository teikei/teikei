Teikei.module("Views", function(Views, App, Backbone, Marionette, $, _) {

  Views.Login = Marionette.View.extend({

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

    onFormSubmit: function(e) {
      e.preventDefault();
      var email = this.ui.email.val();
      var password = this.ui.password.val();

      console.log(email, password);
    }

  });
});
