Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.DetailsView = Marionette.ItemView.extend({

    className: "reveal-modal details-view",
    template: "places/details",
    templateHelpers: _.extend(Teikei.templateHelpers, { timeago: $.timeago}),

    ui: {
      infoTab: "#info-tab",
      contactTab: "#contact-tab",
      membershipTab: "#membership-tab",
      infoPane: "#info",
      contactPane: "#contact",
      membershipPane: "#membership"
    },

    events: {
      "click #info-tab": "onInfoTabClick",
      "click #membership-tab": "onMembershipTabClick",
      "click #contact-tab": "onContactTabClick",
      "click .call-to-action": "onMembershipPromoClick"
    },

    initialize: function(options) {
      this.model = options.model;
      this.model.fetch();
      this.bindTo(this.model, "change", this.render, this);
    },

    onRender: function() {
      var $el = this.$el;
      _.defer(function(){
        $el.reveal();
      });
    },

    close: function(event) {
      this.$el.trigger("reveal:close");
    },

    onInfoTabClick: function(event) {
      event.preventDefault();
      this.ui.infoPane.addClass("active");
      this.ui.membershipPane.removeClass("active");
      this.ui.contactPane.removeClass("active");
    },

    onContactTabClick: function(event) {
      event.preventDefault();
      this.ui.infoPane.removeClass("active");
      this.ui.membershipPane.removeClass("active");
      this.ui.contactPane.addClass("active");
    },

    onMembershipTabClick: function(event) {
      event.preventDefault();
      this.ui.infoPane.removeClass("active");
      this.ui.membershipPane.addClass("active");
      this.ui.contactPane.removeClass("active");
    },

    onMembershipPromoClick: function(event) {
      this.ui.membershipTab.click();
    }
  });
});
