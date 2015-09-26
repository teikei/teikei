var Spinner = require('spin');

Backbone.Form.editors.Geocoder = Backbone.Form.editors.Base.extend({

  template: JST["form_editors/geocoder"],

  ui: {
    cityInput: "#geocoder-city",
    addressInput: "#geocoder-address",
    previewMap: ".preview-map",
    previewMarker: ".preview-marker",
    previewButton: ".preview-button",
    alertBox: ".alert-box"
  },

  events: {
    "click .preview-button": "geocodeLocation",
    "blur #geocoder-address": "geocodeLocation",
    "blur #geocoder-city": "geocodeLocation",
    "keypress input": "onKeyPress",

    'change': function() {
      // The 'change' event should be triggered whenever something happens
      // that affects the result of `this.getValue()`.
      this.trigger('change', this);
    },
    'focus': function() {
      // The 'focus' event should be triggered whenever an input within
      // this editor becomes the `document.activeElement`.
      this.trigger('focus', this);
      // This call automatically sets `this.hasFocus` to `true`.
    },
    'blur': function() {
      // The 'blur' event should be triggered whenever an input within
      // this editor stops being the `document.activeElement`.
      this.trigger('blur', this);
      // This call automatically sets `this.hasFocus` to `false`.
    }
  },

  mapZoomLevel: 14,
  mapWidth: 600,
  mapHeight: 240,
  spinner: new Spinner(),

  initialize: function(options) {
    _.bindAll( this, 'render' );

    // Call parent constructor
    Backbone.Form.editors.Base.prototype.initialize.call(this, options);

    this.model = new Entities.Geocoder();
    this.listenTo(this.model, "geocoder:success", this.showPreviewTile);
    this.listenTo(this.model, "geocoder:error", this.showError);
    this.markerType = options.schema.markerType;
  },

  render: function() {
    // Load the compiled HTML into the Backbone "el"
    this.$el.html( this.template );

    // Borrow Marionette's UI binding pattern
    new Marionette.View().bindUIElements.call(this);

    return this;
  },

  geocodeLocation: function() {
    var city = this.ui.cityInput.val();
    var address = this.ui.addressInput.val();

    if (city === undefined || address === undefined) {
      throw "Input fields (city, address) for geocoding are not present.";
    }

    if (city === "" || address === "") {
      return;
    }

    this.clearMapPreview();
    this.model.query(city, address);
  },

  clearMapPreview: function() {
    this.ui.previewMarker.hide();
    this.spinner.spin(this.ui.previewMap[0]);
  },

  showPreviewTile: function() {
    var source = this.placeholderSource;
    var lat = this.model.get("latitude");
    var lng = this.model.get("longitude");
    var previewMarker = this.ui.previewMarker;
    var previewMap = this.ui.previewMap;
    var alertBox = this.ui.alertBox;
    var markerType = this.markerType || "depot";
    var img = new Image();
    if (lat && lng) {
      source = "//api.tiles.mapbox.com/v3/{APIKEY}/{LNG},{LAT},{ZOOM}/{WIDTH}x{HEIGHT}.png"
      .replace("{APIKEY}", Places.MapConfig.APIKEY)
      .replace("{ZOOM}", this.mapZoomLevel)
      .replace("{WIDTH}", this.mapWidth)
      .replace("{HEIGHT}", this.mapHeight)
      .replace("{LAT}", lat)
      .replace("{LNG}", lng);


      var spinner = this.spinner;
      // only show marker if location is valid
      img.onload = function() {
        spinner.stop();
        previewMarker[0].src = "/assets/marker-" + markerType + ".svg";
        previewMarker.show();
        previewMap.css("background-image", "url(" + img.src + ")");
        alertBox.hide();
      };

      img.src = source;
    }
  },

  showError: function(message) {
    this.spinner.stop();
    this.ui.previewMarker.hide();
    this.ui.previewMap.css("background-image", "none");
    this.ui.alertBox.html(message.error);
    this.ui.alertBox.show();
  },

  getValue: function() {
    var loc = {
      longitude: this.model.get("longitude"),
      latitude: this.model.get("latitude"),
      city: this.ui.cityInput.val(),
      address: this.ui.addressInput.val()
    };
    if (loc.longitude && loc.longitude) {
      return loc;
    }
  },

  setValue: function(value) {
    if (value) {
      this.ui.cityInput.val(value.city);
      this.ui.addressInput.val(value.address);
      this.model.set({
        latitude: value.latitude,
        longitude: value.longitude
      });
      this.showPreviewTile();
    }
  },

  focus: function() {
    var cityInput = this.ui.cityInput;
    if (cityInput.hasFocus) return;
    cityInput.focus();
  },

  enterKeyPressed: function(event) {
    return event && (event.which == 10 || event.which == 13);
  },

  onKeyPress: function(event) {
    if (this.enterKeyPressed(event)) {
      this.geocodeLocation();
    }
  }
});
