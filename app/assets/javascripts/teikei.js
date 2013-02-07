
// Overwriting Backbone.Marionette.Renderer to use JST
Backbone.Marionette.Renderer.render = function(template, data){
  if (!JST[template]) throw "Template '" + template + "' not found!";
  return JST[template](data);
}

Teikei = new Backbone.Marionette.Application();

Teikei.addRegions({
  mainRegion: '#list-container',
  mapRegion: '#map-container',
  popupRegion: "#popup-container"
});

Teikei.addInitializer(function(options){
  var userController = new Teikei.User.Controller();
  var placesController = new Teikei.Places.Controller();
});

$(function(){
  Teikei.start();
});
