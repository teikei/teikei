Teikei.module("Participate", function(Participate, App, Backbone, Marionette, $, _) {

  Participate.Controller = Backbone.Marionette.Controller.extend({

    initialize: function() {
      App.vent.on("show:participate:1", this.showInfos1, this);
      App.vent.on("show:participate:2", this.showInfos2, this);
    },

    initializeModal: function() {
      this.participateView = new Teikei.Participate.ParticipateView();
      App.modalRegion.show(this.participateView);

      this.participateView.bind("tab:1:click", function(){
        this.navigateToTab(1);
      }, this);

      this.participateView.bind("tab:2:click", function(){
        this.navigateToTab(2);
      }, this);

      this.participateView.bind("signup:click", function(){
        App.vent.trigger("show:signup");
      }, this);
    },

    showInfos1: function() {
      this.initializeModal();
      this.navigateToTab(1);
    },

    showInfos2: function() {
      this.initializeModal();
      this.navigateToTab(2);
    },

    navigateToTab: function(tabNum) {
      this.participateView.showInfos(tabNum);
      Backbone.history.navigate('info/' + tabNum);
    }
  });
});
