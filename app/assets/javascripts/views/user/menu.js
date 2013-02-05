Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  User.MenuView = Marionette.View.extend({

    el: "#user",

    ui: {
      toggle: "#login"
    },

    events: {
      "click #login": "login"
    },

    initialize: function(controller) {
      this.bindUIElements();
      this.controller = controller;
      App.vent.on("login", this.onLogin, this);
    },

    login: function(event) {
      event.preventDefault();
      this.controller.loginPopup()
    },

    onLogin: function() {
      this.ui.toggle.text("Abmelden")
      this.ui.toggle.off("click", this.login)
      this.ui.toggle.attr("href", "/users/sign_out")
    },

    onLogout: function() {
      this.ui.toggle.text("Anmelden")
      this.ui.toggle.on("click", this.login)
    }

  });
});
