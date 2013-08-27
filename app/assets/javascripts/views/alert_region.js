//= require views/modal_region

Teikei.module("Base", function(Base, App, Backbone, Marionette, $, _) {

  Base.AlertRegion = Base.ModalRegion.extend({
    el: "#alert-container"
  });
});
