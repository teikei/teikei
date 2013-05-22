Teikei.module("Participate", function(Participate, App, Backbone, Marionette, $, _) {

  Participate.Controller = Backbone.Marionette.Controller.extend({

    initialize: function() {
      this.participateView = new Teikei.Participate.ParticipateView(this);

      App.vent.on("participate:for:citizens", this.showConsumerInfos, this);
      App.vent.on("participate:for:farmers", this.showFarmerInfos, this);

      this.participateView.bind("consumers:tab:click", this.showConsumerInfos, this);
      this.participateView.bind("farmers:tab:click", this.showFarmerInfos, this);

      App.participatePopup.show(this.participateView);
    },

    showConsumerInfos: function() {
      this.participateView.showConsumerInfos();
    },

    showFarmerInfos: function() {
      this.participateView.showFarmerInfos();
    }

  });
});
