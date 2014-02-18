Teikei.module("Base", function(Base, Teikei, Backbone, Marionette, $, _) {
  Base.AlertRegion = Backbone.Marionette.Region.extend({

    el: "#alert-container",

    open: function(view){
      Marionette.Region.prototype.open.apply(this, arguments);
      this.$el.hide();
      this.$el.fadeIn("fast");
    },

    close: function(){
      this.$el.fadeOut("fast", function() {
        Marionette.Region.prototype.close.apply(this, arguments);
      });
    }

  });
});
