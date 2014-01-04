Teikei.module("Participate", function(Participate, App, Backbone, Marionette, $, _) {

  Participate.ParticipateView = Teikei.Base.ItemView.extend({

    className: "reveal-modal",
    template: "participate/participate",

    ui: {
      firstTab: "#info-1-tab",
      secondTab: "#info-2-tab",
      firstPane: "#info-1",
      secondPane: "#info-2"
    },

    triggers: {
      "click #info-1-tab": "tab:1:click",
      "click #info-2-tab": "tab:2:click",
      "click #participate-signup": "signup:click"
    },

    showInfos: function(tabNum) {
      this["_showInfos" + tabNum]();
    },

    _showInfos1: function() {
      this.activateTab(this.ui.firstTab, [this.ui.secondTab]);
      this.activatePane(this.ui.firstPane, [this.ui.secondPane]);
    },

    _showInfos2: function() {
      this.activateTab(this.ui.secondTab, [this.ui.firstTab]);
      this.activatePane(this.ui.secondPane, [this.ui.firstPane]);
    }

  });
});
