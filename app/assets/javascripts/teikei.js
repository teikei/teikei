// Overwriting Backbone.Marionette.Renderer to use JST
Backbone.Marionette.Renderer.render = function(template, data) {
  if (!JST[template]) throw "Template '" + template + "' not found!";
  return JST[template](data);
};

Teikei = new Backbone.Marionette.Application();

Teikei.addRegions({
  main: '#list-container',
  map: '#map-container',
  userPopup: "#user-popups",
  placesPopup: "#places-popups"
});

Teikei.addInitializer(function(options){
  var userController = new Teikei.User.Controller();
  var placesController = new Teikei.Places.Controller();
});

$(function(){
  Teikei.start();
});
