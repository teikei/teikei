Teikei.module("User", function(User, Teikei, Backbone, Marionette, $, _) {

  User.MenuView = Marionette.ItemView.extend({

    el: "#user-menu",

    template: "user/menu",

    ui: {
      signIn: "#signin",
      myEntriesMenuItem: "#my-entries",
      newEntryMenuItem: "#new-entry",
      newEntryDropdown: "#new-entry .dropdown",
      userDropdown: ".account-menu .dropdown"
    },

    events: {
      "click #new-entry": "openNewEntryDropdown",
      "click #signup": "onSignUp",
      "click #add-farm": "addFarm",
      "click #add-depot": "addDepot",
      "click #my-entries": "showEntryList",
    },

    triggers: {
      "click #signin": "signin:selected",
    },

    initialize: function() {
      this.bindUIElements();
      this.invalidate();
      Teikei.vent.on("user:signin:success", this.invalidate, this);
    },

    invalidate: function() {
      this.model = Teikei.currentUser;
      if (Teikei.currentUser) {
        this.renderSignedInState();
      }
      else {
        this.renderSignedOutState();
      }
    },

    openNewEntryDropdown: function() {
      this.openDropdown(this.ui.newEntryDropdown);
    },

    // TODO Merge function with duplicate in entryList.js
    openDropdown: function(dropdown) {
      dropdown.show();
      _.defer( function() {
        $("body").one("click", function() {
          dropdown.hide();
        });
      });
    },

    addFarm: function(event) {
      event.preventDefault();
      Teikei.vent.trigger("user:add:farm");
    },

    addDepot: function(event) {
      event.preventDefault();
      Teikei.vent.trigger("user:add:depot");
    },

    showEntryList: function(event) {
      event.preventDefault();
      Teikei.vent.trigger("user:show:entrylist");
    },

    onSignUp: function(event) {
      event.preventDefault();
      this.trigger("signup:selected");
    },

    renderSignedInState: function() {
      this.render();
      this.ui.signIn.hide();
      this.ui.userName.show();
      this.ui.newEntryMenuItem.show();
      this.ui.myEntriesMenuItem.show();
    },

    renderSignedOutState: function() {
      this.render();
      this.ui.signIn.show();
      this.ui.userName.hide();
      this.ui.newEntryMenuItem.hide();
      this.ui.myEntriesMenuItem.hide();
      this.ui.userDropdown.hide();
    }

  });
});
