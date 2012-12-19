
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
  var placesListView = new Teikei.Views.PlacesList({
    collection: options.places
  });
  var mapView = new Teikei.Views.Map()
  Teikei.mainRegion.show(placesListView);
  Teikei.mapRegion.show(mapView);
});

$(function(){

  var cats = new Teikei.Collections.Places([
    new Teikei.Models.Place({ location: [52.50, 13.50], title: 'John' }),
    new Teikei.Models.Place({ location: [52.40, 13.30], title: 'Paul' }),
    new Teikei.Models.Place({ location: [52.57, 13.40], title: 'George' }),
    new Teikei.Models.Place({ location: [52.54, 13.56], title: 'Ringo' })
  ]);

  Teikei.start({places: cats});
});
