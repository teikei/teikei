Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.EntryListItemView = Marionette.ItemView.extend({
    template: "places/list/entryListItem",

    initialize: function(options) {
      _.bindAll( this, 'render' );

      // Call parent constructor
      Marionette.ItemView.prototype.initialize.call(this, options);
      this.model = options.model;
      this.bindUIElements();
      this.showPreviewTile();
    },

    ui: {
      previewMap: ".preview-map",
      previewMarker: ".preview-marker",
    },

    events: {
      "click .edit-entry": "editEntry",
      "click .delete-entry": "deleteEntry",
      "click .show-entry": "showEntry"
    },

    editEntry: function(){
      App.vent.trigger("edit:entry", this.model);
    },

    deleteEntry: function(){
      App.vent.trigger("delete:entry", this.model);
    },

    showEntry: function(){
      App.vent.trigger("show:entry", this.model);
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
        source = "http://api.tiles.mapbox.com/v3/{APIKEY}/{LNG},{LAT},{ZOOM}/{WIDTH}x{HEIGHT}.png"
        .replace("{APIKEY}", App.Places.MapConfig.APIKEY)
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
    }
  });

  Places.EntryListEmptyView = Marionette.ItemView.extend({
    template: "places/list/entryListEmptyView"
  });

  Places.EntryListView = Marionette.CompositeView.extend({

    ui: {
      newEntryMenuItem: "#new-entry-my-entries",
      newEntryDropdown: "#new-entry-my-entries .dropdown",
    },

    events: {
      "click #new-entry-my-entries": "openNewEntryDropdown",
      "click #add-farm": "addFarm",
      "click #add-depot": "addDepot"
    },

    openNewEntryDropdown: function() {
      var dropdown = this.ui.newEntryDropdown;
      dropdown.show();
      _.defer( function() {
        $("body").one("click", function() {
          dropdown.hide();
        });
      });
    },

    addFarm: function(event) {
      event.preventDefault();
      App.vent.trigger("user:add:farm");
    },

    addDepot: function(event) {
      event.preventDefault();
      App.vent.trigger("user:add:depot");
    },

    className: "reveal-modal large",
    template: "places/list/entryList",

    itemView: Places.EntryListItemView,
    itemViewContainer: "#entrylist",
    emptyView: Places.EntryListEmptyView,

    initialize: function(options) {
      this.collection = options.collection;
    }
  });

});
