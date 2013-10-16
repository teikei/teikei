Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  User.MenuView = Marionette.View.extend({

    el: "#user",

    ui: {
      signInToggle: "#signin",
      signUpToggle: "#signup",
      currentUserMenuItem: "#current_user",
      participateMenuItem: "#participate",
      newEntryMenuItem: "#new-entry",
      myEntriesMenuItem: "#my-entries"
    },

    events: {
      "click #signin": "toggleAuth",
      "click #signup": "onSignUp",
      "click #add-farm": "addFarm",
      "click #add-depot": "addDepot",
      "click #my-entries": "showEntryList",
      "click #participate-depot": "onParticipateDepot",
      "click #participate-farm": "onParticipateFarm"
    },

    initialize: function() {
      this.bindUIElements();
      this.invalidate();
      App.vent.on("user:signin:success", this.invalidate, this);
      App.vent.on("user:logout:success", this.invalidate, this);
    },

    toggleAuth: function(event) {
      event.preventDefault();
      var signedIn = this.model.tokenIsPresent();
      if (!signedIn) {
        this.trigger("signin:selected");
      }
      else {
        this.trigger("logout:selected");
      }
    },

    invalidate: function() {
      var signedIn = this.model.tokenIsPresent();
      if (signedIn) {
        var userName = this.model.get("name");
        this.renderSignedInState(userName);
      }
      else {
        this.renderSignedOutState();
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

    showEntryList: function(event) {
      event.preventDefault();
      App.vent.trigger("user:show:entrylist");
    },

    onParticipateDepot: function(event) {
      event.preventDefault();
      App.vent.trigger("show:consumer:infos");
    },

    onParticipateFarm: function(event) {
      event.preventDefault();
      App.vent.trigger("show:farmer:infos");
    },

    onSignUp: function(event) {
      event.preventDefault();
      this.trigger("signup:selected");
    },

    renderSignedInState: function(userName) {
      this.ui.signInToggle.text("Abmelden");
      this.ui.signInToggle.attr("href", "/users/sign_out");
      this.ui.signUpToggle.text("Einstellungen");
      this.ui.signUpToggle.attr("href", "/users/edit");
      this.ui.participateMenuItem.hide();
      this.ui.newEntryMenuItem.show();
      this.ui.myEntriesMenuItem.show();
      this.ui.currentUserMenuItem.text(userName);
      this.ui.currentUserMenuItem.parent().show();
    },

    renderSignedOutState: function() {
      this.ui.signInToggle.text("Anmelden");
      this.ui.signInToggle.attr("href", "/users/sign_in");
      this.ui.signUpToggle.text("Registrieren");
      this.ui.signUpToggle.attr("href", "/users/sign_up");
      this.ui.participateMenuItem.show();
      this.ui.newEntryMenuItem.hide();
      this.ui.myEntriesMenuItem.hide();
      this.ui.currentUserMenuItem.text("");
      this.ui.currentUserMenuItem.parent().hide();
    }

  });
});
