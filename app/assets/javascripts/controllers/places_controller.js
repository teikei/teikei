Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.Controller = Backbone.Marionette.Controller.extend( {

    initialize: function(){
      this.collection = new Teikei.Places.Collection();
      this.mapView = new Teikei.Places.MapView({ collection: this.collection });
      this.collection.fetch()
      App.mainRegion.show(this.mapView);
    }

  })

})
