const DEFAULT_ZOOM = 10;
const MIN_ZOOM = 6;
const MAX_ZOOM = 14;
const PADDING = L.point(0, 120); // offset for header bar

Places.MapView = Marionette.ItemView.extend({

  element: '#map',

  markers: [],

  initialize(options) {
    this.defaultBounds = options.defaultBounds;
    this.collection.once('reset', this.initMap, this);
    this.collection.bind('change', this.updateMap, this);
    this.collection.bind('add', this.add, this);
  },

  showTip(id) {
    const marker = _.find(this.markers, item => {
      return Number(id) === item.model.id;
    });
    this.initTip(marker);
    marker.openPopup();
  },

  initTip(marker) {
    if (marker === undefined) {
      return;
    }
    let model = marker.model;
    const mapItemView = new Places.MapItemView({model: model});
    mapItemView.render();
    marker.bindPopup(mapItemView.el, {
      offset: L.point(0, -55),
      autoPanPaddingTopLeft: PADDING
    });

    this.listenTo(mapItemView, 'select:details', () => {
      this.trigger('select:details', model.id, model.get('type'));
    }, this);

    this.listenTo(mapItemView, 'select:network', () => {
      this.trigger('select:network', model.id, model.get('type'));
    }, this);
  },

  add(model) {
    this.updateMap();
    this.map.setView(this.getLatLng(model), DEFAULT_ZOOM);
    this.showTip(model.id);
  },

  centerTo(lat, lng) {
    this.map.setView(new L.LatLng(lat, lng), MAX_ZOOM);
  },

  updateMap(model) {
    this.markerLayer.clearLayers();
    this.markers = this.initMarkers(this.collection);
    this.markerLayer = this.initMarkerLayer(this.markers);
    this.map.addLayer(this.markerLayer);
  },

  hilightMarkers(places) {
    const bounds = [];
    _.each(this.markers, marker => {
      marker.setOpacity(0.3);
      _.each(places, place => {
        if (place.id === marker.model.id) {
          marker.setOpacity(1);
          bounds.push(marker.getLatLng());
        }
      });
    });
    this.map.fitBounds(bounds, {paddingTopLeft: PADDING});
  },

  drawNetwork(places) {
    let networkLayer = this.networkLayer;
    const farms = _.filter(places, item => {
      return item.type === 'Farm';
    });
    const depots = _.filter(places, item => {
      return item.type === 'Depot';
    });

    _.each(farms, farm => {
      _.each(depots, depot => {
        const latlngs = [
          new L.LatLng(farm.latitude, farm.longitude),
          new L.LatLng(depot.latitude, depot.longitude)
        ];
        const polyline = L.polyline(latlngs, {color: '#a00e46', weight: 2});
        polyline.addTo(networkLayer);
      });
    });
  },

  hilightNetwork(model) {
    const places = _.map(model.get('places'), item => {
      return item.place;
    });
    places.push(model.attributes);
    this.drawNetwork(places);
    this.hilightMarkers(places);
  },

  unHilightNetwork() {
    _.each(this.markers, marker => {
      _.defer(() => {
        marker.setOpacity(1);
      });
    });
    this.networkLayer.clearLayers();
    Backbone.history.navigate('/');
  },

  showArea(bounds) {
    this.map.fitBounds(bounds, {paddingTopLeft: PADDING});
  },

  initMap() {
    this.markers = this.initMarkers(this.collection);
    this.tileLayer = this.initTileLayer();
    this.networkLayer = L.layerGroup();
    this.markerLayer = this.initMarkerLayer(this.markers);
    this.map = L.map('map', {
      attributionControl: false,
      maxZoom: MAX_ZOOM,
      minZoom: MIN_ZOOM
    });
    this.map.fitBounds(this.defaultBounds, {paddingTopLeft: PADDING});
    this.map.addLayer(this.tileLayer);
    this.map.addLayer(this.networkLayer);
    this.map.addLayer(this.markerLayer);
    this.map.on('popupclose', _.bind(this.unHilightNetwork, this));
  },

  initMarkerLayer(markers) {
    const markerGroup = new L.MarkerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: function(cluster) {
        const markers = cluster.getAllChildMarkers();
        const clusterView = new Places.MarkerCluster({markers: markers});
        return clusterView.getLeafletIcon();
      }
    });
    markerGroup.addLayers(markers);
    return markerGroup;
  },

  initMarkers(collection) {
    const markers = [];
    collection.each(model => {
      const marker = this.initMarker(model);
      if (marker) markers.push(marker);
    }, this);
    return markers;
  },

  initMarker(model) {
    const type = model.get('type');
    const icon = new Places.MarkerIcon[type]();
    const location = this.getLatLng(model);

    if (location) {
      const marker = L.marker(location, {icon: icon});
      marker.model = model;
      this.initTip(marker);
      marker.on('popupopen', _.bind(() => {
        Backbone.history.navigate(`places/${model.id}/tip`);
      }, this));
      marker.on('popupclose', _.bind(() => {
        Backbone.history.navigate('');
      }, this));
      return marker;
    }
  },

  getLatLng(model) {
    const lat = model.get('latitude');
    const lng = model.get('longitude');
    if (lat && lng) {
      return new L.LatLng(lat, lng);
    }
  },

  initTileLayer() {
    return L.tileLayer(`//{s}.tiles.mapbox.com/v3/${Places.MapConfig.APIKEY}/{z}/{x}/{y}.png`);
  }

});
