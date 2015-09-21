var timeago = require('timeago');

var IMAGE_PLACEHOLDER = '/assets/placeimage-placeholder.png';

Places.DetailsView = Base.ItemView.extend({

  className: "details-view",
  template: "places/details",
  templateHelpers: _.extend({
    timeago: timeago,
    ownedByCurrentUser: function() {
      var result = false;
      if (this.ownerships.length > 0 && Teikei.currentUser) {
        var currentUserOwnerships = this.ownerships.filter(function(o) {
          return o.user_id === Teikei.currentUser.get('id');
        });
        result = currentUserOwnerships.length > 0;
      }
      return result;

    },
    placesFilteredByType: function(places, type) {
      return _.filter(places, function(place) {
        return place.type === type;
      });
    },
    temporalConnectionWord: function(year, month) {
      var foundedAt = new Date(year, month);
      var today = new Date();
      var inThePast = foundedAt < today;
      return (inThePast) ? I18n.t('forms.labels.since') : I18n.t('forms.labels.from');
    },
    getContactName: function() {
      var name = "";
      if (this.ownerships.length > 0) {
        name = I18n.t("forms.labels.name") + ": " + this.ownerships[0].name;
      }
      return name;
    },
    getContactPhone: function() {
      var phone = "";
      if (this.ownerships.length > 0) {
        var firstOwnerPhone = this.ownerships[0].phone;
        if (firstOwnerPhone) {
          phone = I18n.t("forms.labels.phone") + ": " + firstOwnerPhone;
        }
      }
      return phone;
    },
    getImageUrl: function() {
      var imageUrl = IMAGE_PLACEHOLDER;
      if (this.image) {
        imageUrl = this.image.url;
      }
      return imageUrl;
    },
    translatedProducts: function(farm) {
      return _.union(farm.animal_products,
        farm.vegetable_products,
        farm.beverages).map(function(p) {
          return I18n.t('products.' + p);
        }).join(', ');
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
    Teikei.vent.on("place:message:success", this.showSuccessMessage, this);
    Teikei.vent.on("place:message:failure", this.showFailureMessage, this);
  },

  onRender: function() {
    var $container = this.ui.placeMessageFormContainer;
    var ownercount = this.model.get("ownerships").length;
    var schemata = this.schemata();
    var forms = [];

    _.each(schemata, function(schema, formId) {
      var templateFile;

      if (formId !== "placeMessageForm" || (formId === "placeMessageForm" && ownercount > 0)) {
        templateFile = Marionette.Renderer.render("places/details/" + formId);
        var form = new Backbone.Form({
          model: this.model,
          schema: schema,
          template: _.template(templateFile)
        }).render();

        forms.push(form);
        form.$el.hide();
        $container.append(form.$el);
      } else {
        templateFile = Marionette.Renderer.render("places/details/placeMessageNoOwner");
        $container.append(_.template(templateFile));
      }


    }, this);

    _.defer(function() {
      forms[0].$el.show();
    });

    this.forms = forms;
    this.step = 0;
    this.bindUIElements();
  },

  onEditPlace: function(event) {
    event.preventDefault();
    Teikei.vent.trigger("edit:entry", this.model);
  },

  onSubmitClick: function(event) {
    event.preventDefault();

    var model = this.model;
    var forms = this.forms;
    var errors = forms[this.step].validate();
    var data = forms[this.step].getValue();

    if (errors === null) {
      this.hideAlertMessage(true);
      this.trigger("placeMessageForm:submit", {
        place_id: model.id,
        name: data.placeMessageName,
        email: data.placeMessageEmail,
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
    this.showError(xhr, I18n.t("forms.messages.sending_email_failed"));
  },

  onInfoTabClick: function(event) {
    event.preventDefault();
    this.ui.infoTab.addClass("active");
    this.ui.membershipTab.removeClass("active");
    this.ui.contactTab.removeClass("active");
    this.ui.infoPane.addClass("active");
    this.ui.membershipPane.removeClass("active");
    this.ui.contactPane.removeClass("active");
  },

  onContactTabClick: function(event) {
    event.preventDefault();
    this.ui.infoTab.removeClass("active");
    this.ui.membershipTab.removeClass("active");
    this.ui.contactTab.addClass("active");
    this.ui.infoPane.removeClass("active");
    this.ui.membershipPane.removeClass("active");
    this.ui.contactPane.addClass("active");
  },

  onMembershipTabClick: function(event) {
    event.preventDefault();
    this.ui.infoTab.removeClass("active");
    this.ui.membershipTab.addClass("active");
    this.ui.contactTab.removeClass("active");
    this.ui.infoPane.removeClass("active");
    this.ui.membershipPane.addClass("active");
    this.ui.contactPane.removeClass("active");
  },

  onMembershipPromoClick: function(event) {
    this.ui.membershipTab.click();
  }
});
