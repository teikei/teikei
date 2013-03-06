Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.MapView = Marionette.ItemView.extend({

    markers: [],
    template: "places/map",

    initialize: function(options) {
      this.collection = options.collection;
      this.collection.bind("reset", this.initMap, this);
      this.collection.bind("add", this.updateMap, this);
    },

    showTip: function(id) {
      var marker = _.find(this.markers, function(item){
        return id === item.marker.model.id;
      });
      initTip(marker);
    },

    initTip: function(marker) {
      var model = marker.model;
      var mapItemView = new Places.MapItemView({model: model});
      mapItemView.render();
      marker.bindPopup(mapItemView.el);
      marker.openPopup();

      this.bindTo(mapItemView, "select:details", function(){
        this.trigger("select:details", model.id, model.get("type"));
      }, this);

      this.bindTo(mapItemView, "select:network", function(){
        this.trigger("select:network", model.id, model.get("type"));
      }, this);
    },

    updateMap: function() {
      this.markerLayer.clearLayers();
      this.markerLayer = this.initMarkerLayer(this.collection);
      this.map.addLayer(this.markerLayer);
    },

    hilightNetwork: function(model) {
      var places = model.get("places");
      var bounds = [];

      _.each(this.markers, function(marker) {
        marker.setOpacity(0.3);
        _.each(places, function(item){
          if (item.place.id === marker.model.id || model.id === marker.model.id) {
            marker.setOpacity(1);
            bounds.push(marker.getLatLng());
          }
        });
      });

      this.map.fitBounds(bounds);
    },

    initMap: function() {
      this.tileLayer = this.initTileLayer();
      this.markerLayer = this.initMarkerLayer(this.collection);
      this.map = L.map("map").setView([52.52, 13.39], 10);
      this.map.addLayer(this.tileLayer);
      this.map.addLayer(this.markerLayer);
      this.map.on("popupclose", _.bind(this.resetMarkers, this));
    },

    initMarkerLayer: function(collection) {
      var markers = this.markers;
      collection.each(function(model){
        var marker = this.initMarker(model);
        marker && markers.push(marker);
      }, this);
      return L.layerGroup(markers);
    },

    initMarker: function(model) {
      var lat = model.get("latitude");
      var lng = model.get("longitude");
      var type = model.get("type");
      var icon = new Places.MarkerIcon[type]();

      if (lat && lng) {
        var location = new L.LatLng(lat, lng);
        var marker = L.marker(location, {icon: icon});
        marker.model = model;
        marker.on("click", _.bind(function () {
          this.initTip(marker);
        }, this));
        return marker;
      }
    },

    resetMarkers: function() {
      _.each(this.markers, function(marker) {
        marker.setOpacity(1);
      });
    },

    initTileLayer: function() {
      return L.tileLayer("http://{s}.tiles.mapbox.com/v3/" + Places.MapConfig.APIKEY + "/{z}/{x}/{y}.png", {
        attribution: "Map data &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a></a>"
      });
    }

  });
});
