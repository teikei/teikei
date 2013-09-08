Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.MapView = Marionette.ItemView.extend({

    element: "#map",

    markers: [],

    initialize: function() {
      this.collection.once("reset", this.initMap, this);
      this.collection.bind("change", this.updateMap, this);
    },

    showTip: function(id) {
      var marker = _.find(this.markers, function(item){
        return Number(id) === item.model.id;
      });
      this.initTip(marker);
    },

    initTip: function(marker) {
      if (marker === undefined) {
        return;
      }
      var model = marker.model;
      var mapItemView = new Places.MapItemView({model: model});
      mapItemView.render();
      marker.bindPopup(mapItemView.el, {offset: L.point(0, -55)});
      marker.openPopup();

      this.listenTo(mapItemView, "select:details", function(){
        this.trigger("select:details", model.id, model.get("type"));
      }, this);

      this.listenTo(mapItemView, "select:network", function(){
        this.trigger("select:network", model.id, model.get("type"));
      }, this);
    },

    updateMap: function(model) {
      this.markerLayer.clearLayers();
      this.markerLayer = this.initMarkerLayer(this.collection);
      this.map.addLayer(this.markerLayer);
    },

    hilightMarkers: function(places) {
      var bounds = [];
      _.each(this.markers, function(marker) {
        marker.setOpacity(0.3);
        _.each(places, function(place){
          if (place.id === marker.model.id) {
            marker.setOpacity(1);
            bounds.push(marker.getLatLng());
          }
        });
      });
      this.map.fitBounds(bounds);
    },

    drawNetwork: function(places) {
      var networkLayer = this.networkLayer;
      var farms = _.filter(places, function(item) {
        return item.type === "Farm";
      });
      var depots = _.filter(places, function(item) {
        return item.type === "Depot";
      });

      _.each(farms, function(farm) {
        _.each(depots, function(depot) {
          var latlngs = [
            new L.LatLng(farm.latitude, farm.longitude),
            new L.LatLng(depot.latitude, depot.longitude)
          ];
          var polyline = L.polyline(latlngs, {color: '#a00e46', weight: 2});
          polyline.addTo(networkLayer);
        });
      });
    },

    hilightNetwork: function(model) {
      var places = _.map(model.get("places"), function(item) {
        return item.place;
      });
      places.push(model.attributes);
      this.drawNetwork(places);
      this.hilightMarkers(places);
    },

    unHilightNetwork: function() {
      _.each(this.markers, function(marker) {
        _.defer(function(){
          marker.setOpacity(1);
        });
      });
      this.networkLayer.clearLayers();
      Backbone.history.navigate('/');
    },

    showArea: function(bounds) {
      this.map.fitBounds(bounds);
    },

    initMap: function() {
      this.tileLayer = this.initTileLayer();
      this.networkLayer = L.layerGroup();
      this.markerLayer = this.initMarkerLayer(this.collection);
      this.map = L.map("map").setView([52.52, 13.39], 10);
      this.map.addLayer(this.tileLayer);
      this.map.addLayer(this.networkLayer);
      this.map.addLayer(this.markerLayer);
      this.map.on("popupclose", _.bind(this.unHilightNetwork, this));
    },

    initMarkerLayer: function(collection) {
      var markers = this.markers = [];
      collection.each(function(model){
        var marker = this.initMarker(model);
        if (marker) markers.push(marker);
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
          Backbone.history.navigate('places/' + model.id + '/tip');
          this.initTip(marker);
        }, this));
        return marker;
      }
    },

    initTileLayer: function() {
      return L.tileLayer("http://{s}.tiles.mapbox.com/v3/" + Places.MapConfig.APIKEY + "/{z}/{x}/{y}.png", {
        attribution: "Map data &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a></a>"
      });
    }

  });
});
