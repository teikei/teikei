Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  User.MegaDropView = Marionette.View.extend({

    el: "#mega-drop",

    ui: {
      toggle: ".toggle",
      slider: ".slider",
      toggleText: ".toggle b"
    },

    isOpen: false,

    events: {
      "click .toggle": "toggleDropdown"
    },

    initialize: function(controller) {
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
    }
  });
});
