Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  User.MegaDropView = Marionette.View.extend({

    el: "#mega-drop",

    ui: {
      toggle: ".toggle",
      slider: ".slider"
    },

    events: {
      "click .toggle": "toggleDropdown"
    },

    initialize: function(controller) {
      this.bindUIElements();
    },

    toggleDropdown: function(controller) {
      this.ui.slider.animate({ height: "toggle", opacity: "toggle"}, 200 );
    }

  });
});
