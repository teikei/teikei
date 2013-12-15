Teikei.module("Participate", function(Participate, App, Backbone, Marionette, $, _) {

  Participate.Controller = Backbone.Marionette.Controller.extend({

    initialize: function() {
      this.participateView = new Teikei.Participate.ParticipateView();

      this.participateView.bind("tab:1:click", this.navigateToTab1, this);
      this.participateView.bind("tab:2:click", this.navigateToTab2, this);

      App.vent.on("show:participate:1", this.showInfos1, this);
      App.vent.on("show:participate:2", this.showInfos2, this);
    },

    showInfos1: function() {
      App.modalRegion.show(this.participateView);
      this.participateView.showInfos1();
      this.navigateToTab(1);
    },

    showInfos2: function() {
      App.modalRegion.show(this.participateView);
      this.participateView.showInfos2();
      this.navigateToTab(2);
    },

    navigateToTab: function(tabNum) {
      Backbone.history.navigate('info/' + tabNum);
    }

  });
});
