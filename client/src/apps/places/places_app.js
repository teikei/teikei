require('./views/area_select');
require('./views/delete_entry');
require('./views/details');
require('./views/details_message_form');
require('./views/entry');
require('./views/entry_depot');
require('./views/entry_farm');
require('./views/map');
require('./views/map_config');
require('./views/map_item');
require('./views/marker_cluster');
require('./views/marker_icon');

Teikei.module("Places", function(Places, Teikei, Backbone, Marionette, $, _) {

  Places.Controller = {

    placeAdded: function(place) {
      Places.collection.add(place, {merge: true});
    },

    refreshCollection: function() {
      Places.collection.fetch({reset: true, async: false});
    },

    updateMap: function() {
      Places.mapView.updateMap();
    },

    editEntryById: function(id) {
      var model = Places.collection.get(id);
      Places.Controller.editEntry(model);
    },

    editEntry: function(model) {
      var showEntryForm = this.showEntryForm;
      model.fetch({
        success: function(model, response, options) {
          var type = model.get("type");
          Backbone.history.navigate("places/" + model.id + "/edit");
          if (type == "Farm") {
            showEntryForm(Places.EntryFarmView, "Angaben zum Betrieb editieren", model, model.collection);
          }
          else if (type == "Depot") {
            showEntryForm(Places.EntryDepotView, "Angaben zur Gruppe editieren", model, model.collection);
          }
        }
      });
    },

    deleteEntry: function(model) {
      Places.deleteEntryView = new Places.DeleteEntryView({model: model});
      Teikei.modalRegion.show(Places.deleteEntryView);
    },

    submitPlaceMessage: function(data) {
      var model = Places.placeMessage;
      model.save(data, {
        success: function(model, response, options) {
          var message = model.get("message");
          if (message === undefined) {
            message = "Deine Nachricht wurde erfolgreich versandt.";
          }
          Teikei.vent.trigger("place:message:success", message);
        },
        error: function(model, xhr, options) {
          Teikei.vent.trigger("place:message:failure", xhr);
        }
      });
    },

    showEntryDepotForm: function() {
      Backbone.history.navigate("places/new/depot");
      Places.Controller.showEntryForm(Places.EntryDepotView, "Neues Depot eintragen", new Teikei.Entities.Place(), this.collection);
    },

    showEntryFarmForm: function() {
      Backbone.history.navigate("places/new/farm");
      Places.Controller.showEntryForm(Places.EntryFarmView, "Neuen Betrieb eintragen", new Teikei.Entities.Place(), this.collection);
    },

    showEntryForm: function(EntryView, headline, model, collection) {
      Places.entryView = new EntryView({
        model: model,
        collection: collection,
        headline: headline
      });

      Teikei.modalRegion.show(Places.entryView);
    },

    showTip: function(id) {
      Places.mapView.showTip(id);
    },

    showDetails: function(id) {
      Backbone.history.navigate('places/' + id + '/details');
      var model = Places.collection.get(id);
      var detailsView = new Places.DetailsMessageFormView({model: model});
      detailsView.bind("placeMessageForm:submit", Places.Controller.submitPlaceMessage, this);
      model.fetch({
        success: function() {
          Teikei.modalRegion.show(detailsView);
        }
      });
      Places.detailsView = detailsView;
    },

    showNetwork: function(id) {
      Backbone.history.navigate('places/' + id + '/network');
      var model = Places.collection.get(id);
      model.fetch({
        reset: true,
        success: function() {
          Places.mapView.hilightNetwork(model);
        }
      });
    },

    showArea: function(area) {
      Backbone.history.navigate('region/' + area);
      var bounds = Places.Controller.areas[area].boundingBox;
      Places.areaSelectView.setOption(area);
      Places.mapView.showArea(bounds);
    },

    areas: {
      default: {
        boundingBox: [[47.2703, 5.8667], [54.0585, 15.0419]],
        displayName: "– Region auswählen –"
      },
      badenwuerttemberg: {
        boundingBox: [[47.53649305, 7.51464013], [49.79146623, 10.49316881]],
        displayName: "Baden-Württemberg"
      },
      bayern: {
        boundingBox: [[47.375413747749, 9.0138020303575], [50.52894177871, 13.778139870618]],
        displayName: "Bayern"
      },
      berlin: {
        boundingBox: [[52.34036388, 13.08202030], [52.67513452, 13.75919894]],
        displayName: "Berlin"
      },
      brandenburg: {
        boundingBox: [[51.37290595, 11.52257448], [53.4422936, 14.76043039]],
        displayName: "Brandenburg"
      },
      bremen: {
        boundingBox: [[53.01178044, 8.48481361], [53.61724353, 8.98567032]],
        displayName: "Bremen"
      },
      hamburg: {
        boundingBox: [[53.40379255, 9.72553048], [53.74377926, 10.32093009]],
        displayName: "Hamburg"
      },
      hessen: {
        boundingBox: [[49.424422875576, 7.8929499403926], [51.642662359768, 10.169420952568]],
        displayName: "Hessen"
      },
      mecklenburgvorpommern: {
        boundingBox: [[53.03571508, 10.59654082], [54.68554689, 14.41140225]],
        displayName: "Mecklenburg-Vorpommern"
      },
      niedersachsen: {
        boundingBox: [[51.345311762478, 6.7262675430345], [53.861496555212, 11.53823531012]],
        displayName: "Niedersachsen"
      },
      nordrheinwestfalen: {
        boundingBox: [[50.295548494094, 5.9727062460994], [52.458013499343, 9.3433886724435]],
        displayName: "Nordrhein-Westfalen"
      },
      rheinlandpfalz: {
        boundingBox: [[48.981394998725, 6.1663513644433], [50.894350425086, 8.4843531451824]],
        displayName: "Rheinland-Pfalz"
      },
      saarland: {
        boundingBox: [[49.150206425505, 6.4301869510914], [49.580450149947, 7.3422225266438]],
        displayName: "Saarland"
      },
      sachsen: {
        boundingBox: [[50.227306916175, 11.910955394381], [51.619488059107, 14.984191213722]],
        displayName: "Sachsen"
      },
      sachsenanhalt: {
        boundingBox: [[50.93271029, 10.56776225], [53.04129493, 13.20518063]],
        displayName: "Sachsen-Anhalt"
      },
      schleswigholstein: {
        boundingBox: [[53.36901763, 8.27628665], [55.05749480, 11.31648578]],
        displayName: "Schleswig-Holstein"
      },
      thueringen: {
        boundingBox: [[50.275284274617, 9.9722530122477], [51.604201493063, 12.577030471843]],
        displayName: "Thüringen"
      }
    }
  };

  Teikei.vent.on("user:add:depot", Places.Controller.showEntryDepotForm, Places.Controller);
  Teikei.vent.on("user:add:farm", Places.Controller.showEntryFarmForm, Places.Controller);
  Teikei.vent.on("user:show:entrylist", Places.Controller.showEntryList, Places.Controller);

  Teikei.vent.on("edit:entry", Places.Controller.editEntry, Places.Controller);
  Teikei.vent.on("delete:entry", Places.Controller.deleteEntry, Places.Controller);

  Teikei.vent.on("place:deleted", Places.Controller.updateMap, Places.Controller);
  Teikei.vent.on("place:added", Places.Controller.placeAdded, Places.Controller);


  Teikei.addInitializer(function() {
    Places.placeMessage = new Teikei.Entities.PlaceMessage();
    Places.collection = new Teikei.Entities.Places();
    Places.collection.bind("reset", function(collection) {
      Teikei.vent.trigger("places:change", collection);
    });

    Places.mapView = new Places.MapView({
      collection: Places.collection,
      defaultBounds: Places.Controller.areas.default.boundingBox
    });

    Places.areaSelectView = new Teikei.Places.AreaSelectView({
      areas: Places.Controller.areas
    });
    Teikei.controlsRegion.show(Places.areaSelectView);

    Places.areaSelectView.bind("select:area", Places.Controller.showArea, this);

    Places.mapView.bind("select:details", Places.Controller.showDetails, this);
    Places.mapView.bind("select:network", Places.Controller.showNetwork, this);


    Places.Controller.refreshCollection();
  });

  Places.Router = Backbone.Marionette.AppRouter.extend({
    controller: Places.Controller,

    appRoutes: {
      'places/:id/tip': 'showTip',
      'places/:id/network': 'showNetwork',
      'places/:id/details': 'showDetails',
      'places/new/farm': 'showEntryFarmForm',
      'places/new/depot': 'showEntryDepotForm',
      'places/:id/edit': 'editEntryById',
      'region/:area': 'showArea'
    }
  });

  Teikei.addInitializer(function() {
    new Teikei.Places.Router({
      controller: Places.Controller
    });
  });
});
