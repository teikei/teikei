  // Item List View
  // --------------
  //
  // Controls the rendering of the list of items, including the
  // filtering of activs vs completed items for display.

Teikei.module('Views', function(Views, App, Backbone, Marionette, $, _) {

  Views.PlacesList = Backbone.Marionette.CompositeView.extend({
    template: 'PlacesList',
    itemView: Teikei.Views.PlaceItem,

    appendHtml: function(collectionView, itemView){
      collectionView.$("#places-list").append(itemView.el);    
    }

  });

});
