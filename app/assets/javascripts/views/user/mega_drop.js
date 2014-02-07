Teikei.module("User", function(User, Teikei, Backbone, Marionette, $, _) {

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
        this.ui.toggle[0].title = "Klicke hier, um die nachfolgenden Informationen auszublenden.";
      }
      else {
        this.ui.toggleText.text("mehr erfahren");
        this.ui.toggle[0].title = "Klicke hier, um weitere Informationen anzuzeigen.";
      }
    },

    onStartForConsumers: function() {
      Teikei.vent.trigger("show:consumer:infos");
    },

    onStartForFarmers: function() {
      Teikei.vent.trigger("show:farmer:infos");
    }

  });
});
