Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.DetailsView = Marionette.ItemView.extend({

    className: "reveal-modal medium",
    template: "places/details",

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
    }

  });
});
