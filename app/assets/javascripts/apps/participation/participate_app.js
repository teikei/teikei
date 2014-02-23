Teikei.module("Participate", function(Participate, Teikei, Backbone, Marionette, $, _) {
  Participate.Controller = {
    _navigateToTab: function(tabNum) {
      var participateView = new Teikei.Participate.ParticipateView();
      Teikei.modalRegion.show(participateView);
      participateView.showInfos(tabNum);
    },

    showInfos1: function() {
      Participate.Controller._navigateToTab(1);
    },

    showInfos2: function() {
      Participate.Controller._navigateToTab(2);
    }
  };

  Teikei.vent.on("show:participate:1", Participate.Controller.showInfos1, Participate.Controller);
  Teikei.vent.on("show:participate:2", Participate.Controller.showInfos2, Participate.Controller);

  Participate.Router = Backbone.Marionette.AppRouter.extend({
    appRoutes: {
      'info/1': 'showInfos1',
      'info/2': 'showInfos2'
    }
  });

  Teikei.addInitializer(function(){
    new Teikei.Participate.Router({
      controller: Participate.Controller
    });
  });
});
