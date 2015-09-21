User.MenuView = Marionette.ItemView.extend({

  el: "#user-menu",

  template: "user/menu",

  model: Teikei.currentUser,

  ui: {
    signin: "#signin",
    addFarm: "#add-farm",
    addDepot: "#add-depot",
    myEntries: "#my-entries"
  },

  events: {
    "click @ui.addFarm": "addFarm",
    "click @ui.addDepot": "addDepot",
    "click @ui.myEntries": "showEntryList",
    "click @ui.signin": "signin"
  },

  templateHelpers: function() {
    currentUser = this.model;
    return {
      isLoggedIn: function() {
        return _.isObject(currentUser);
      }
    };
  },

  initialize: function() {
    this.render();
    Teikei.vent.on("user:signin:success", this.updateLoginState, this);
  },

  updateLoginState: function(currentUser) {
    this.model = currentUser;
    this.render();
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

  signin: function(event) {
    event.preventDefault();
    this.trigger("signin:selected");
  }
});
