Teikei.module("Participate", function(Participate, Teikei, Backbone, Marionette, $, _) {


  Participate.Controller = {
    initializeModal: function() {
      var participateView = new Teikei.Participate.ParticipateView();
      Teikei.modalRegion.show(participateView);

      participateView.bind("tab:1:click", function(){
        Participate.Controller.navigateToTab(1);
      }, Participate.Controller);

      participateView.bind("tab:2:click", function(){
        Participate.Controller.navigateToTab(2);
      }, Participate.Controller);

      participateView.bind("signup:click", function(){
        Teikei.vent.trigger("show:signup");
      }, Participate.Controller);

      // TODO shouldn't be necessary
      Participate.participateView = participateView;
    },

    showInfos1: function() {
      Participate.Controller.initializeModal();
      Participate.Controller.navigateToTab(1);
    },

    showInfos2: function() {
      Participate.Controller.initializeModal();
      Participate.Controller.navigateToTab(2);
    },

    // TODO move to view
    navigateToTab: function(tabNum) {
      Participate.participateView.showInfos(tabNum);
      Backbone.history.navigate('info/' + tabNum);
    }
  }

  Teikei.vent.on("show:participate:1", Participate.Controller.showInfos1, this);
  Teikei.vent.on("show:participate:2", Participate.Controller.showInfos2, this);

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
