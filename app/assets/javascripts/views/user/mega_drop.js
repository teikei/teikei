Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  User.MegaDropView = Marionette.View.extend({

    el: "#mega-drop",

    ui: {
      toggle: ".toggle-button",
      slider: ".slider",
      toggleText: ".toggle-button b"
    },

    isOpen: false,

    events: {
      "click .toggle-button": "toggleDropdown",
      "click #start-for-consumers": "onStartForConsumers",
      "click #start-for-farmers": "onStartForFarmers"
    },

    initialize: function() {
      this.bindUIElements();
    },

    toggleDropdown: function(controller) {
      this.isOpen = !this.isOpen;
      this.ui.slider.animate({ height: "toggle", opacity: "toggle"}, 200 );
      this.ui.toggle.toggleClass("open");
      if (this.isOpen) {
        this.ui.toggleText.text("ausblenden");
      }
      else {
        this.ui.toggleText.text("mehr erfahren");
      }
    },

    onStartForConsumers: function() {
      App.vent.trigger("show:consumer:infos");
    },

    onStartForFarmers: function() {
      App.vent.trigger("show:farmer:infos");
    }

  });
});
