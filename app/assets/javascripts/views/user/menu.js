Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  User.MenuView = Marionette.View.extend({

    el: "#user",

    ui: {
      toggle: "#login",
      addPlace: "#add-place"
    },

    events: {
      "click #login": "toggleAuth",
      "click #add-place": "addDepot",
      "click #add-place": "addFarm"
    },

    initialize: function(controller) {
      this.bindUIElements();
      App.vent.on("user:login:success", this.onLogin, this);
      App.vent.on("user:logout:success", this.onLogout, this);
    },

    toggleAuth: function(event) {
      event.preventDefault();
      var loggedIn = this.model.get("loggedIn");
      if (!loggedIn) {
        this.trigger("login:selected");
      }
      else {
        this.trigger("logout:selected");
      }
    },

    addFarm: function(event) {
      event.preventDefault();
      App.vent.trigger("user:add:farm");
    },

    addFarmDepot: function(event) {
      event.preventDefault();
      App.vent.trigger("user:add:depot");
    },

    onLogin: function() {
      this.ui.toggle.text("Abmelden");
    },

    onLogout: function() {
      this.ui.toggle.text("Anmelden");
    }
  });
});
