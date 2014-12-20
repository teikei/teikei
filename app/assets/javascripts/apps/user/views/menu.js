Teikei.module("User", function(User, Teikei, Backbone, Marionette, $, _) {

  User.MenuView = Marionette.ItemView.extend({

    el: "#user-menu",

    template: "user/menu",

    ui: {
      signIn: "#signin",
      userName: "#user-menu-toggle",
      entriesNav: "#entries-nav"
    },

    events: {
      "click #signup": "onSignUp",
      "click #add-farm": "addFarm",
      "click #add-depot": "addDepot",
      "click #my-entries": "showEntryList"
    },

    triggers: {
      "click #signin": "signin:selected"
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
      this.ui.entriesNav.show();
    },

    renderSignedOutState: function() {
      this.render();
      this.ui.signIn.show();
      this.ui.userName.hide();
      this.ui.entriesNav.hide();
    }
  });
});
