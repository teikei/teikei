
// Overwriting Backbone.Marionette.Renderer to use JST
Backbone.Marionette.Renderer.render = function(template, data){
  if (!JST[template]) throw "Template '" + template + "' not found!";
  return JST[template](data);
}

Teikei = new Backbone.Marionette.Application();

Teikei.addRegions({
  mainRegion: '#list-container',
  mapRegion: '#map-container'
});

Teikei.addInitializer(function(options){
  var loginView = new Teikei.Views.Login();
  var placesListView = new Teikei.Views.PlacesList({
    collection: options.places
  });
  var mapView = new Teikei.Views.Map({
    collection: options.places
  })
  Teikei.mainRegion.show(placesListView);
  Teikei.mapRegion.show(mapView);
});

$(function(){

  var places = new Teikei.Collections.Places();

  places.fetch({ url: "/api/v1/farms.json", success: function() {
    Teikei.start({places: places});
  }});

});
