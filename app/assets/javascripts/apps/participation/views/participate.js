Teikei.module("Participate", function(Participate, Teikei, Backbone, Marionette, $, _) {
  Participate.ParticipateView = Teikei.Base.ItemView.extend({
    className: "reveal-modal large",

    template: "participate/participate",

    ui: {
      firstTab: "#info-1-tab",
      secondTab: "#info-2-tab",
      firstPane: "#info-1",
      secondPane: "#info-2"
    },

    events: {
      "click #info-1-tab": "showInfos1",
      "click #info-2-tab": "showInfos2",
    },

    triggers: {
      "click #participate-signup": "show:signup"
    },

    showInfos: function(tabNum) {
      this["showInfos" + tabNum]();
    },

    showInfos1: function() {
      Backbone.history.navigate('info/1');
      this.activateTab(this.ui.firstTab, [this.ui.secondTab]);
      this.activatePane(this.ui.firstPane, [this.ui.secondPane]);
    },

    showInfos2: function() {
      Backbone.history.navigate('info/2');
      this.activateTab(this.ui.secondTab, [this.ui.firstTab]);
      this.activatePane(this.ui.secondPane, [this.ui.firstPane]);
    }
  });
});
