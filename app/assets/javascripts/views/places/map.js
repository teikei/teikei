Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.MapView = Marionette.ItemView.extend({

    markers: [],
    template: "places/map",

    initialize: function(options) {
      this.collection = options.collection;
      this.collection.bind("reset", this.initMap, this);
    },

    initMap: function() {
      var map = L.map("map").setView([52.52, 13.39], 10);
      var tileLayer = this.initTileLayer();
      var markerLayer = this.initMarkerLayer(this.collection);
      map.addLayer(tileLayer);
      map.addLayer(markerLayer);
    },

    initMarkerLayer: function(collection) {
      var markers = [];
      collection.each(function(model){
        var marker = this.initMarker(model);
        marker && markers.push(marker);
      }, this)
      return L.layerGroup(markers);
    },

    initMarker: function(model) {
      var lat = model.get("latitude");
      var lng = model.get("longitude");
      var icon = new Places.MarkerIcon.Farm();

      if (lat && lng) {
        var location = new L.LatLng(lat, lng);
        var marker = L.marker(location, {icon: icon});
        marker.model = model;
        marker.on("click", _.bind(function () {
          this.trigger("marker:select", marker);
        }, this));
        return marker;
      }
    },

    initTileLayer: function() {
      return L.tileLayer("http://{s}.tiles.mapbox.com/v3/" + Places.MapConfig.APIKEY + "/{z}/{x}/{y}.png", {
        attribution: "Map data &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a></a>",
      });
    }

  });
});
