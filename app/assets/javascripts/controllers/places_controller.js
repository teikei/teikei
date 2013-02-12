Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.Controller = Backbone.Marionette.Controller.extend( {

    initialize: function(){
      this.collection = new Teikei.Places.Collection();
      this.mapView = new Teikei.Places.MapView({
        collection: this.collection
      });
      this.collection.fetch();

      //this.mapView.bind("marker:select", this.openTip);

      App.mainRegion.show(this.mapView);
    },

    openTip: function(marker) {
      var mapItemView = new Places.MapItemView({model: marker.model});
      mapItemView.render();
      marker.bindPopup(mapItemView.el).openPopup();
    }

  })

})
