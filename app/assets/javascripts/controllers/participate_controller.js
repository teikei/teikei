Teikei.module("Participate", function(Participate, App, Backbone, Marionette, $, _) {

  Participate.Controller = Backbone.Marionette.Controller.extend({

    initialize: function() {
      this.participateView = new Teikei.Participate.ParticipateView(this);

      App.vent.on("participate:for:citizens", this.showConsumerInfos, this);
      App.vent.on("participate:for:farmers", this.showFarmerInfos, this);


      App.participatePopup.show(this.participateView);
    },

    showConsumerInfos: function() {
    },

    showFarmerInfos: function() {
    }

  });
});
