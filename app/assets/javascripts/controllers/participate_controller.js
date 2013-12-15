Teikei.module("Participate", function(Participate, App, Backbone, Marionette, $, _) {

  Participate.Controller = Backbone.Marionette.Controller.extend({

    initialize: function() {
      this.participateView = new Teikei.Participate.ParticipateView();

      this.participateView.bind("tab:1:click", function(){
        this.navigateToTab(1);
      }, this);

      this.participateView.bind("tab:2:click", function(){
        this.navigateToTab(2);
      }, this);

      App.vent.on("show:participate:1", this.showInfos1, this);
      App.vent.on("show:participate:2", this.showInfos2, this);
    },

    showInfos1: function() {
      App.modalRegion.show(this.participateView);
      this.navigateToTab(1);
    },

    showInfos2: function() {
      App.modalRegion.show(this.participateView);
      this.navigateToTab(2);
    },

    navigateToTab: function(tabNum) {
      this.participateView.showInfos(tabNum);
      Backbone.history.navigate('info/' + tabNum);
    }
  });
});
