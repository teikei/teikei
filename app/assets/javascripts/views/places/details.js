Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.DetailsView = Teikei.Base.ItemView.extend({

    className: "reveal-modal details-view xlarge",
    template: "places/details",
    templateHelpers: _.extend({
      timeago: $.timeago,
      ownedByCurrentUser: function() {
        return this.user_id === Teikei.currentUser.get('id');
      },
      placesFilteredByType: function(places, type) {
        return _.filter(places, function(item) {
          return item.place.type == type;
        });
      },
      temporalConnectionWord: function(year, month) {
        var foundedAt = new Date(year, month);
        var today = new Date();
        var inThePast = foundedAt < today;
        return Teikei.Util.temporalConnectionWord(inThePast);
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
      submitButton: ".submit",
      placeImage: "#placeimage"
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
        var templateFile = Marionette.Renderer.render("places/details/" + formId);
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
      this.setImage();

    },

    setImage: function() {
      var image = this.model.get("image");
      if (image){
        this.ui.placeImage.attr("src", image.url);
      }
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
          place_id: model.id,
          sender_name: data.placeMessageName,
          sender_email: data.placeMessageEmail,
          message: data.placeMessageMessage
        });
      }
    },

    showSuccessMessage: function(message) {
      this.showAlertMessage(message, "success");
      var form = this.forms[this.step];
      this.clearForm(form);
    },

    clearForm: function(form) {
      form.setValue("placeMessageName", "");
      form.setValue("placeMessageEmail", "");
      form.setValue("placeMessageMessage", "");
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
