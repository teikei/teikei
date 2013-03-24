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

      App.vent.on("user:add:farm", this.showEntryForm, this);

      App.main.show(this.mapView);
    },

    showEntryForm: function() {
      var entryView = new Places.EntryView({
        model: new Places.Model(),
        collection: this.collection
      });
      App.placesPopup.show(entryView);
    },

    showTip: function(id) {
      this.mapView.showTip(id);
    },

    showDetails: function(id) {
      var detailsView = new Places.DetailsView({
        model: this.collection.get(id)
      });
      App.placesPopup.show(detailsView);
    },

    showNetwork: function(id) {
      var model = this.collection.get(id);
      var mapView = this.mapView;
      model.fetch({
        success: function(){
          mapView.hilightNetwork(model);
        }
      });
    },

    showArea: function(area) {
      this.mapView.showArea(area);
    }

  });

});
