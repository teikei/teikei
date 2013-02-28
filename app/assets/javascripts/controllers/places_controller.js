Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.Controller = Backbone.Marionette.Controller.extend( {

    initialize: function(){
      this.collection = new Teikei.Places.Collection();
      this.mapView = new Teikei.Places.MapView({
        collection: this.collection
      });

      this.collection.fetch();
      this.mapView.bind("select:details", this.showDetails, this);
      this.mapView.bind("select:network", this.showNetwork, this);
      App.main.show(this.mapView);
    },

    showTip: function(id) {
      this.mapView.showTip(id);
    },

    showDetails: function(id, type) {
      var detailsView = new Places.DetailsView({
        model: this.collection.get(id)
      });
      App.placesPopup.show(detailsView);
    },

    showNetwork: function(id, type) {
      var model = this.collection.get(id);
      model.fetch();
      console.log("Show network!", id, type, model);
    }

  });

});
