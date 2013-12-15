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

    events: {
      "click #info-1-tab": "onFirstTabClick",
      "click #info-2-tab": "onSecondTabClick"
    },

    onRender: function() {
      var view = this;
      var $el = this.$el;
    },

    onFirstTabClick: function(event) {
      event.preventDefault();
      this.showInfos1();
      this.trigger("tab:1:click");
    },

    onSecondTabClick: function(event) {
      event.preventDefault();
      this.showInfos2();
      this.trigger("tab:2:click");
    },

    showInfos1: function() {
      this.activateFirstTab();
      this.activateFirstPane();
    },

    showInfos2: function() {
      this.activateSecondTab();
      this.activateSecondPane();
    },

    activateFirstTab: function() {
      this.activateTab(this.ui.firstTab,
        new Array(this.ui.secondTab)
      );
    },

    activateSecondTab: function() {
      this.activateTab(this.ui.secondTab,
        new Array(this.ui.firstTab)
      );
    },

    activateFirstPane: function() {
      this.activatePane(this.ui.firstPane,
        new Array(this.ui.secondPane)
      );
    },

    activateSecondPane: function() {
      this.activatePane(this.ui.secondPane,
        new Array(this.ui.firstPane)
      );
    }

  });
});
