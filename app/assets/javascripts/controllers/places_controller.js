Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.Controller = Backbone.Marionette.Controller.extend( {

    initialize: function(){
      this.collection = new Teikei.Places.Collection();
      this.collection.bind("reset", function(collection){
        App.vent.trigger("places:change", collection);
      });

      this.mapView = new Teikei.Places.MapView({
        collection: this.collection
      });

      this.mapView.bind("select:details", this.showDetails, this);
      this.mapView.bind("select:network", this.showNetwork, this);

      App.vent.on("user:add:depot", this.showEntryDepotForm, this);
      App.vent.on("user:add:farm", this.showEntryFarmForm, this);

      this.collection.fetch({reset: true});
      App.main.show(this.mapView);
    },

    showEntryDepotForm: function() {
      Backbone.history.navigate("places/new/depot");
      if (!this.entryDepotView) {
        this.entryDepotView = new Places.EntryDepotView({
          model: new Places.Model(),
          collection: this.collection
        });
      }
      App.placesPopup.show(this.entryDepotView);
    },

    showEntryFarmForm: function() {
      Backbone.history.navigate("places/new/farm");
      if (!this.entryFarmView) {
        this.entryFarmView = new Places.EntryFarmView({
          model: new Places.Model(),
          collection: this.collection
        });
      }
      App.placesPopup.show(this.entryFarmView);
    },

    showTip: function(id) {
      Backbone.history.navigate('places/' + id + '/tip');
      this.mapView.showTip(id);
    },

    showDetails: function(id) {
      Backbone.history.navigate('places/' + id + '/details');
      var detailsView = new Places.DetailsView({
        model: this.collection.get(id)
      });
      App.placesPopup.show(detailsView);
    },

    showNetwork: function(id) {
      Backbone.history.navigate('places/' + id + '/network');
      var model = this.collection.get(id);
      var mapView = this.mapView;
      model.fetch({
        reset: true,
        success: function(){
          mapView.hilightNetwork(model);
        }
      });
    },

    showArea: function(area){
      Backbone.history.navigate('region/' + area);
      var bounds = this.areas[area];
      this.mapView.showArea(bounds);
    },

    areas: {
      mecklenburgvorpommern: [[ 53.03571508, 10.59654082 ],[ 54.68554689, 14.41140225 ]],
      badenwuerttemberg: [[ 47.53649305, 7.51464013 ],[ 49.79146623, 10.49316881 ]],
      schleswigholstein: [[ 53.36901763, 8.27628665 ],[ 55.05749480, 11.31648578 ]],
      hamburg: [[ 53.40379255, 9.72553048 ],[ 53.74377926, 10.32093009 ]],
      niedersachsen: [[ 51.345311762478, 6.7262675430345 ],[ 53.861496555212, 11.53823531012 ]],
      bremen: [[ 53.01178044, 8.48481361 ],[ 53.61724353, 8.98567032 ]],
      brandenburg: [[ 51.37290595, 11.52257448 ],[ 53.4422936, 14.76043039 ]],
      berlin: [[ 52.34036388, 13.08202030 ],[ 52.67513452, 13.75919894 ]],
      sachsenanhalt: [[ 50.93271029, 10.56776225 ],[ 53.04129493, 13.20518063 ]],
      sachsen: [[ 50.227306916175, 11.910955394381 ],[ 51.619488059107, 14.984191213722 ]],
      thueringen: [[ 50.275284274617, 9.9722530122477 ],[ 51.604201493063, 12.577030471843 ]],
      bayern: [[ 47.375413747749, 9.0138020303575 ],[ 50.52894177871, 13.778139870618 ]],
      hessen: [[ 49.424422875576, 7.8929499403926 ],[ 51.642662359768, 10.169420952568 ]],
      rheinlandpfalz: [[ 48.981394998725, 6.1663513644433 ],[ 50.894350425086, 8.4843531451824 ]],
      saarland: [[ 49.150206425505, 6.4301869510914 ],[ 49.580450149947, 7.3422225266438 ]],
      nordrheinwestfalen: [[ 50.295548494094, 5.9727062460994 ],[ 52.458013499343, 9.3433886724435 ]]
    }

  });

});
