Teikei.module("Participate", function(Participate, Teikei, Backbone, Marionette, $, _) {

  Participate.Controller = Backbone.Marionette.Controller.extend({

    initialize: function() {
      Teikei.vent.on("show:participate:1", this.showInfos1, this);
      Teikei.vent.on("show:participate:2", this.showInfos2, this);
    },

    initializeModal: function() {
      this.participateView = new Teikei.Participate.ParticipateView();
      Teikei.modalRegion.show(this.participateView);

      this.participateView.bind("tab:1:click", function(){
        this.navigateToTab(1);
      }, this);

      this.participateView.bind("tab:2:click", function(){
        this.navigateToTab(2);
      }, this);

      this.participateView.bind("signup:click", function(){
        Teikei.vent.trigger("show:signup");
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
