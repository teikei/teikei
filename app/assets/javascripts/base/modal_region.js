Teikei.module("Base", function(Base, Teikei, Backbone, Marionette, $, _) {

  Base.ModalRegion = Backbone.Marionette.Region.extend({
    el: "#modal-container",

    onShow: function(view){
      view.$el.reveal({
        closeOnBackgroundClick: false,
        closed: this.close
      });
    }
  });
});
