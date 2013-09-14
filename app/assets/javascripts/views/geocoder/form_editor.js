Teikei.module("Geocoder", function(Geocoder, App, Backbone, Marionette, $, _) {

  Geocoder.FormEditor = Backbone.Form.editors.Base.extend({

    template: JST["geocoder/form_editor"],

    ui: {
      cityInput: "#geocoder-city",
      addressInput: "#geocoder-address",
      previewMap: ".preview-map",
      previewMarker: ".preview-marker",
      previewButton: ".preview-button"
    },

    events: {
      "click .preview-button": "geocodeLocation",
      "blur #geocoder-address": "geocodeLocation",
      "blur #geocoder-city": "geocodeLocation",

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

    initialize: function(options) {
      _.bindAll( this, 'render' );

      // Call parent constructor
      Backbone.Form.editors.Base.prototype.initialize.call(this, options);

      this.model = new Geocoder.Model();
      this.listenTo(this.model, "geocoder:success", this.showPreviewTile);
    },

    render: function() {
      // Load the compiled HTML into the Backbone "el"
      this.$el.html( this.template );

      // Borrow Marionette's UI binding pattern
      new Marionette.View().bindUIElements.call(this);

      return this;
    },

    geocodeLocation: function(event) {
      if (event && event.keyCode && !this.enterKeyPressed(event)) {
        return;
      }

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
      this.ui.previewMap.spin();
    },

    showPreviewTile: function() {
      var source = this.placeholderSource;
      var lat = this.model.get("latitude");
      var lng = this.model.get("longitude");
      var previewMarker = this.ui.previewMarker;
      var previewMap = this.ui.previewMap;
      var img = new Image();
      if (lat && lng) {
        source = "http://api.tiles.mapbox.com/v3/{APIKEY}/{LNG},{LAT},13/600x200.png"
        .replace("{APIKEY}", App.Places.MapConfig.APIKEY)
        .replace("{LAT}", lat)
        .replace("{LNG}", lng);

        // only show marker if location is valid
        img.onload = function() {
          previewMarker.show();
          previewMap.spin(false);
          previewMap.css("background-image", "url(" + img.src + ")");
        };

        img.src = source;
      }
    },

    getValue: function() {
      console.log("model", this.model);
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
    }
  });
});
