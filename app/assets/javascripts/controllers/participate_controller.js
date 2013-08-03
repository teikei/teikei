Teikei.module("Participate", function(Participate, App, Backbone, Marionette, $, _) {

  Participate.Controller = Backbone.Marionette.Controller.extend({

    initialize: function() {
      this.participateView = new Teikei.Participate.ParticipateView(this);

      App.vent.on("participate:for:citizens", this.showConsumerInfos, this);
      App.vent.on("participate:for:farmers", this.showFarmerInfos, this);

      this.participateView.bind("consumers:tab:click", this.showConsumerInfos, this);
      this.participateView.bind("farmers:tab:click", this.showFarmerInfos, this);
      App.vent.on("show:consumer:infos", this.showConsumerInfos, this);
      App.vent.on("show:farmer:infos", this.showFarmerInfos, this);
    },

    showConsumerInfos: function() {
      App.participatePopup.show(this.participateView);
      this.participateView.showConsumerInfos();
      Backbone.history.navigate('consumerInfos');
    },

    showFarmerInfos: function() {
      App.participatePopup.show(this.participateView);
      this.participateView.showFarmerInfos();
      Backbone.history.navigate('farmerInfos');
    }

  });
});
