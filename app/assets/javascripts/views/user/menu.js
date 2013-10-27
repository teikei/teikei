Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  User.MenuView = Marionette.ItemView.extend({

    el: "#user",

    template: "user/menu",

    ui: {
      signIn: "#signin",
      signUp: "#signup",
      signOut: "#signout",
      currentUserMenuItem: "#current_user",
      participateMenuItem: "#participate",
      myEntriesMenuItem: "#my-entries",
      newEntryMenuItem: "#new-entry",
      newEntryDropdown: "#new-entry .dropdown",
      userDropdown: ".user-menu .dropdown"
    },

    events: {
      "click #new-entry": "openNewEntryDropdown",
      "click #user-name": "openUserDropdown",
      "click #signup": "onSignUp",
      "click #add-farm": "addFarm",
      "click #add-depot": "addDepot",
      "click #my-entries": "showEntryList",
      "click #participate": "onParticipate"
    },

    triggers: {
      "click #signin": "signin:selected",
      "click #signout": "logout:selected"
    },

    initialize: function() {
      this.bindUIElements();
      this.invalidate();
      App.vent.on("user:signin:success", this.invalidate, this);
      App.vent.on("user:logout:success", this.invalidate, this);
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

    openNewEntryDropdown: function() {
      var el = this.ui.newEntryDropdown;
      this.openDropdown(el)
    },

    openUserDropdown: function() {
      var el = this.ui.userDropdown;
      this.openDropdown(el)
    },

    openDropdown: function(dropdown) {
      console.log("open", dropdown);
      dropdown.show();
      _.defer( function() {
        $("body").one("click", function() {
          dropdown.hide();
        })
      });
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

    onParticipate: function(event) {
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
      this.render();
      this.ui.signIn.hide();
      this.ui.signOut.show();
      this.ui.participateMenuItem.hide();
      this.ui.newEntryMenuItem.show();
      this.ui.myEntriesMenuItem.show();
    },

    renderSignedOutState: function() {
      this.render();
      this.ui.signIn.show();
      this.ui.signOut.hide();
      this.ui.participateMenuItem.show();
      this.ui.newEntryMenuItem.hide();
      this.ui.myEntriesMenuItem.hide();
    }

  });
});
