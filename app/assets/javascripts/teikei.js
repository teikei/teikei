
// Overwriting Backbone.Marionette.Renderer to use JST
Backbone.Marionette.Renderer.render = function(template, data){
  if (!JST[template]) throw "Template '" + template + "' not found!";
  return JST[template](data);
}

Teikei = new Backbone.Marionette.Application();

Teikei.addRegions({
  mainRegion: '#main'
});

Teikei.addInitializer(function(options){
  var placesListView = new Teikei.Views.PlacesList({
    collection: options.places
  });
  Teikei.mainRegion.show(placesListView);
});

$(function(){

  var cats = new Teikei.Collections.Places([
    new Teikei.Models.Place({ title: 'John' }),
    new Teikei.Models.Place({ title: 'Paul' }),
    new Teikei.Models.Place({ title: 'George' }),
    new Teikei.Models.Place({ title: 'Ringo' })
  ]);

  Teikei.start({places: cats});
});
