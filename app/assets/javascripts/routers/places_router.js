Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.Router = Backbone.Marionette.AppRouter.extend({
    controller: Places.Controller,

    appRoutes: {
      'places/:id/tip': 'showTip',
      'places/:id/network': 'showNetwork',
      'places/:id/details': 'showDetails',
      'places/new/farm': 'showEntryFarmForm',
      'places/new/depot': 'showEntryDepotForm',
      'places/:id/edit': 'editPlace',
      'region/:area': 'showArea'
    }

  });

});
