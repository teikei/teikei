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
  var userRouter = new Teikei.User.Router({ controller: userController });

  var placesController = new Teikei.Places.Controller();
  var placesRouter = new Teikei.Places.Router({controller: placesController });

});

Teikei.on("initialize:after", function(options){
  if (Backbone.history){
    Backbone.history.start();
  }
});

$(function(){
  Teikei.start();
});
