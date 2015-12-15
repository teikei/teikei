Places.DeleteEntryView = Base.ItemView.extend({

  className: 'reveal-modal large',
  template: 'places/deleteEntry',

  ui: {
    previewMap: '.preview-map',
    previewMarker: '.preview-marker'
  },

  initialize(options) {
    Marionette.ItemView.prototype.initialize.call(this, options);
    this.model = options.model;
  },

  events: {
    'click .cancel': 'cancel',
    'click .delete-entry': 'delete'
  },

  onRender() {
    this.showPreviewTile();
  },

  mapZoomLevel: 14,
  mapWidth: 600,
  mapHeight: 240,

  showPreviewTile() {
    let source = this.placeholderSource;
    const lat = this.model.get('latitude');
    const lng = this.model.get('longitude');
    const previewMarker = this.ui.previewMarker;
    const previewMap = this.ui.previewMap;
    const img = new Image();
    if (lat && lng) {
      source = '//api.tiles.mapbox.com/v3/{APIKEY}/{LNG},{LAT},{ZOOM}/{WIDTH}x{HEIGHT}.png'
        .replace('{APIKEY}', Places.MapConfig.APIKEY)
        .replace('{ZOOM}', this.mapZoomLevel)
        .replace('{WIDTH}', this.mapWidth)
        .replace('{HEIGHT}', this.mapHeight)
        .replace('{LAT}', lat)
        .replace('{LNG}', lng);

      // only show marker if location is valid
      img.onload = function() {
        previewMarker.show();
        previewMap.css('background-image', `url(${img.src})`);
      };

      img.src = source;
    }
  },

  cancel() {
    this.closeView();
  },

  delete() {
    this.model.destroy({
      success: function(model, response, options) {
        Teikei.vent.trigger('place:deleted');
        Alert.renderPlaceDeleteSuccess(model);
      },
      error: function(model, xhr, options) {
        Alert.renderPlaceDeleteFailure(model);
      }
    });
    this.closeView();
  }

});
