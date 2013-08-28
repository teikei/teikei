Teikei.module("Participate", function(Participate, App, Backbone, Marionette, $, _) {

  Participate.Controller = Backbone.Marionette.Controller.extend({

    initialize: function() {
      this.participateView = new Teikei.Participate.ParticipateView();

      this.participateView.bind("consumers:tab:click", this.navigateToConsumerInfos, this);
      this.participateView.bind("farmers:tab:click", this.navigateToFarmerInfos, this);

      App.vent.on("show:consumer:infos", this.showConsumerInfos, this);
      App.vent.on("show:farmer:infos", this.showFarmerInfos, this);
    },

    showConsumerInfos: function() {
      App.modal.show(this.participateView);
      this.participateView.showConsumerInfos();
      this.navigateToConsumerInfos();
    },

    showFarmerInfos: function() {
      App.modal.show(this.participateView);
      this.participateView.showFarmerInfos();
      this.navigateToFarmerInfos();
    },

    navigateToConsumerInfos: function() {
      Backbone.history.navigate('consumerInfos');
    },

    navigateToFarmerInfos: function() {
      Backbone.history.navigate('farmerInfos');
    }

  });
});
