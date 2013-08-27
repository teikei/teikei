Teikei.module("Base", function(Base, App, Backbone, Marionette, $, _) {

  Base.ModalRegion = Backbone.Marionette.Region.extend({
    el: "#modal-container",

    constructor: function(){
      _.bindAll(this);
      Backbone.Marionette.Region.prototype.constructor.apply(this, arguments);
      this.on("show", this.showModal, this);
    },

    showModal: function(view){
      view.$el.reveal({
        closeOnBackgroundClick: false,
        closed: this.close
      });
    }

  });
});
