Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  User.MenuView = Marionette.View.extend({

    el: "#user",

    ui: {
      signInToggle: "#signin",
      signUpToggle: "#signup",
      currentUserMenuItem: "#current_user",
      participateMenuItem: "#participate",
      newEntryMenuItem: "#new-entry"
    },

    events: {
      "click #signin": "toggleAuth",
      "click #signup": "onSignUp",
      "click #add-farm": "addFarm",
      "click #add-depot": "addDepot"
    },

    initialize: function(controller) {
      this.bindUIElements();
      if (this.model.get("loggedIn")){
        this.onSignIn();
      }
      App.vent.on("user:signin:success", this.onSignIn, this);
      App.vent.on("user:logout:success", this.onLogout, this);
    },

    toggleAuth: function(event) {
      event.preventDefault();
      var loggedIn = this.model.get("loggedIn");
      if (!loggedIn) {
        this.trigger("signin:selected");
      }
      else {
        this.trigger("logout:selected");
      }
    },

    addFarm: function(event) {
      event.preventDefault();
      App.vent.trigger("user:add:farm");
    },

    addDepot: function(event) {
      event.preventDefault();
      App.vent.trigger("user:add:depot");
    },

    onSignUp: function(event) {
      var loggedIn = this.model.get("loggedIn");
      if (!loggedIn) {
        event.preventDefault();
        this.trigger("signup:selected");
      }
    },

    onSignIn: function() {
      this.ui.signInToggle.text("Abmelden");
      this.ui.signInToggle.attr("href", "/users/sign_out");
      this.ui.signUpToggle.text("Konto anpassen");
      this.ui.signUpToggle.attr("href", "/users/edit");
      this.updateUserName();
      this.ui.participateMenuItem.hide();
      this.ui.newEntryMenuItem.show();
    },

    onLogout: function() {
      this.ui.signInToggle.text("Anmelden");
      this.ui.signInToggle.attr("href", "/users/sign_in");
      this.ui.signUpToggle.text("Registrieren");
      this.ui.signUpToggle.attr("href", "/users/sign_up");
      this.updateUserName();
      this.ui.newEntryMenuItem.hide();
      this.ui.participateMenuItem.show();
    },

    updateUserName: function() {
      userName = this.model.get("userName");
      if (userName === null || userName === undefined) {
        userName = "";
      }
      this.ui.currentUserMenuItem.text(userName);
    }

  });
});
