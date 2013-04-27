Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.DetailsView = Marionette.ItemView.extend({

    className: "reveal-modal medium",
    template: "places/details",

    ui: {
      infoTab: "#info-tab",
      contactTab: "#contact-tab",
      infoPane: "#info",
      contactPane: "#contact"
    },

    events: {
      "click #info-tab": "onInfoTabClick",
      "click #contact-tab": "onContactTabClick"
    },

    initialize: function(options) {
      this.model = options.model;
      this.model.fetch();
      this.bindTo(this.model, "change", this.render, this);
    },

    onRender: function() {
      var $el = this.$el;
      _.defer(function(){
        $el.reveal();
      });
    },

    close: function(event) {
      this.$el.trigger("reveal:close");
    },

    onInfoTabClick: function(event) {
      event.preventDefault();
      this.ui.infoPane.addClass("active");
      this.ui.contactPane.removeClass("active");
    },

    onContactTabClick: function(event) {
      event.preventDefault();
      this.ui.infoPane.removeClass("active");
      this.ui.contactPane.addClass("active");
    },

  });
});
