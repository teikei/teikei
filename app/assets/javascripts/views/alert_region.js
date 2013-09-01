//= require views/modal_region

Teikei.module("Base", function(Base, App, Backbone, Marionette, $, _) {
  Base.AlertRegion = Backbone.Marionette.Region.extend({
    el: "#alert-container"
  });
});
