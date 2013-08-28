//= require ./../baseItemView

Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.DetailsView = Teikei.Base.ItemView.extend({

    className: "reveal-modal details-view",
    template: "places/details",
    templateHelpers: _.extend({
      timeago: $.timeago,
      ownedByCurrentUser: function() {
        return this.user_id === Teikei.currentUser.get('id');
      }
    }),

    ui: {
      infoTab: "#info-tab",
      contactTab: "#contact-tab",
      membershipTab: "#membership-tab",
      infoPane: "#info",
      contactPane: "#contact",
      membershipPane: "#membership",
      placeMessageFormContainer: "#place-message-form-container",
      submitButton: ".submit"
    },

    events: {
      "click #info-tab": "onInfoTabClick",
      "click #membership-tab": "onMembershipTabClick",
      "click #contact-tab": "onContactTabClick",
      "click .call-to-action": "onMembershipPromoClick",
      "click .submit": "onSubmitClick",
      "click #edit-place": "onEditPlace"
    },

    // Override this with a schema for the actual form:
    schemata: {},

    initialize: function() {
      App.vent.on("place:message:success", this.showSuccessMessage, this);
      App.vent.on("place:message:failure", this.showFailureMessage, this);
    },

    onRender: function() {
      var $el = this.$el;
      var $container = this.ui.placeMessageFormContainer;
      var schemata = this.schemata();
      var forms = [];

      _.each(schemata, function(schema, formId) {
        var templateFile = Marionette.Renderer.render("places/detailsForms/" + formId);
        var form = new Backbone.Form({
          model: this.model,
          schema: schema,
          template: _.template(templateFile)
        }).render();

        forms.push(form);
        form.$el.hide();
        $container.append(form.$el);
      }, this);

      var view = this;
      _.defer(function(){
        forms[0].$el.show();
      });

      this.forms = forms;
      this.step = 0;
      this.bindUIElements();
    },

    onEditPlace: function(event) {
      event.preventDefault();
      App.vent.trigger("edit:entry", this.model);
    },

    onSubmitClick: function(event) {
      event.preventDefault();

      var collection = this.collection;
      var model = this.model;
      var forms = this.forms;
      var errors = forms[this.step].validate();
      var data = forms[this.step].getValue();
      var $el = this.$el;

      if (errors === null) {
        this.hideAlertMessage(true);
        this.trigger("placeMessageForm:submit", {
          places_id: model.id,
          name: data.placeMessageName,
          email: data.placeMessageEmail,
          message: data.placeMessageMessage
        });
      }
    },

    showSuccessMessage: function(placeFormData) {
      var text = "E-Mail erfolgreich an " + placeFormData.name + " versandt.";
      this.showAlertMessage(text, "success");
    },

    showFailureMessage: function(xhr) {
      this.showError(xhr, "Senden der E-Mail fehlgeschlagen!");
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
