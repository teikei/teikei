Teikei.module("Participate", function(Participate, Teikei, Backbone, Marionette, $, _) {

  Participate.Router = Backbone.Marionette.AppRouter.extend({

    appRoutes: {
      'info/1': 'showInfos1',
      'info/2': 'showInfos2'
    }

  });
});
