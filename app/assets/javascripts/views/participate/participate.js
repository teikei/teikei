Teikei.module("Participate", function(Participate, App, Backbone, Marionette, $, _) {

  Participate.ParticipateView = Teikei.Base.ItemView.extend({

    className: "reveal-modal",
    template: "participate/participate",

    ui: {
      consumersTab: "#consumers-tab",
      farmersTab: "#farmers-tab",
      consumersPane: "#consumers",
      farmersPane: "#farmers"
    },

    events: {
      "click #consumers-tab": "onConsumersTabClick",
      "click #farmers-tab": "onFarmersTabClick"
    },

    onRender: function() {
      var view = this;
      var $el = this.$el;
      _.defer(function(){
        $el.reveal({
          closeOnBackgroundClick: false,
          closed: function(){
            view.trigger("reveal:closed");
          }
        });
      });
    },

    onConsumersTabClick: function(event) {
      event.preventDefault();
      this.trigger("consumers:tab:click");
    },

    onFarmersTabClick: function(event) {
      event.preventDefault();
      this.trigger("farmers:tab:click");
    },

    showConsumerInfos: function() {
      this.activateConsumersTab();
      this.activateConsumersPane();
    },

    showFarmerInfos: function() {
      this.activateFarmersTab();
      this.activateFarmersPane();
    },

    activateConsumersTab: function() {
      this.activateTab(this.ui.consumersTab,
        new Array(this.ui.farmersTab)
      );
    },

    activateFarmersTab: function() {
      this.activateTab(this.ui.farmersTab,
        new Array(this.ui.consumersTab)
      );
    },

    activateConsumersPane: function() {
      this.activatePane(this.ui.consumersPane,
        new Array(this.ui.farmersPane)
      );
    },

    activateFarmersPane: function() {
      this.activatePane(this.ui.farmersPane,
        new Array(this.ui.consumersPane)
      );
    }

  });
});
