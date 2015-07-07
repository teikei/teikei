Teikei.module("Places", function(Places, Teikei, Backbone, Marionette, $, _) {

  Places.DeleteEntryView = Teikei.Base.ItemView.extend({

    className: "reveal-modal large",
    template: "places/deleteEntry",

    ui: {
      previewMap: ".preview-map",
      previewMarker: ".preview-marker"
    },

    initialize: function(options) {
      Marionette.ItemView.prototype.initialize.call(this, options);
      this.model = options.model;
    },

    events: {
      "click .cancel": "cancel",
      "click .delete-entry": "delete"
    },

    onRender: function() {
      this.showPreviewTile();
    },

    mapZoomLevel: 14,
    mapWidth: 600,
    mapHeight: 240,

    showPreviewTile: function() {
      var source = this.placeholderSource;
      var lat = this.model.get("latitude");
      var lng = this.model.get("longitude");
      var previewMarker = this.ui.previewMarker;
      var previewMap = this.ui.previewMap;
      var img = new Image();
      if (lat && lng) {
        source = "//api.tiles.mapbox.com/v3/{APIKEY}/{LNG},{LAT},{ZOOM}/{WIDTH}x{HEIGHT}.png"
        .replace("{APIKEY}", Teikei.Places.MapConfig.APIKEY)
        .replace("{ZOOM}", this.mapZoomLevel)
        .replace("{WIDTH}", this.mapWidth)
        .replace("{HEIGHT}", this.mapHeight)
        .replace("{LAT}", lat)
        .replace("{LNG}", lng);

        // only show marker if location is valid
        img.onload = function() {
          previewMarker.show();
          previewMap.css("background-image", "url(" + img.src + ")");
        };

        img.src = source;
      }
    },

    cancel: function() {
      this.closeView();
    },

    delete: function() {
      this.model.destroy({
        success: function(model, response, options) {
          Teikei.vent.trigger("place:deleted");
          Teikei.Alert.renderPlaceDeleteSuccess(model);
        },
        error: function(model, xhr, options) {
          Teikei.Alert.renderPlaceDeleteFailure(model);
        }
      });
      this.closeView();
    }

  });
});
