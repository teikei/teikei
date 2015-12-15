const timeago = require('timeago');

const IMAGE_PLACEHOLDER = '/assets/placeimage-placeholder.png';

Places.DetailsView = Base.ItemView.extend({

  className: 'details-view',
  template: 'places/details',
  templateHelpers: _.extend({
    timeago: timeago,
    ownedByCurrentUser: function() {
      let result = false;
      if (this.ownerships.length > 0 && Teikei.currentUser) {
        const currentUserOwnerships = this.ownerships.filter(o => {
          return o.user_id === Teikei.currentUser.get('id');
        });
        result = currentUserOwnerships.length > 0;
      }
      return result;
    },
    placesFilteredByType: function(places, type) {
      return _.filter(places, place => {
        return place.type === type;
      });
    },
    temporalConnectionWord: function(year, month) {
      const foundedAt = new Date(year, month);
      const today = new Date();
      const inThePast = foundedAt < today;
      return (inThePast) ? I18n.t('forms.labels.since') : I18n.t('forms.labels.from');
    },
    getContactName: function() {
      let name = '';
      if (this.ownerships.length > 0) {
        name = `${I18n.t('forms.labels.name')}: ${this.ownerships[0].name}`;
      }
      return name;
    },
    getContactPhone: function() {
      let phone = '';
      if (this.ownerships.length > 0) {
        const firstOwnerPhone = this.ownerships[0].phone;
        if (firstOwnerPhone) {
          phone = `${I18n.t('forms.labels.phone')}: ${firstOwnerPhone}`;
        }
      }
      return phone;
    },
    getImageUrl: function() {
      let imageUrl = IMAGE_PLACEHOLDER;
      if (this.image) {
        imageUrl = this.image.url;
      }
      return imageUrl;
    },
    translatedProducts: function(farm) {
      return _.union(farm.animal_products,
        farm.vegetable_products,
        farm.beverages).map(p => {
          return I18n.t(`products.${p}`);
        }).join(', ');
    }
  }),

  ui: {
    infoTab: '#info-tab',
    contactTab: '#contact-tab',
    membershipTab: '#membership-tab',
    infoPane: '#info',
    contactPane: '#contact',
    membershipPane: '#membership',
    placeMessageFormContainer: '#place-message-form-container',
    submitButton: '.submit'
  },

  events: {
    'click #info-tab': 'onInfoTabClick',
    'click #membership-tab': 'onMembershipTabClick',
    'click #contact-tab': 'onContactTabClick',
    'click .call-to-action': 'onMembershipPromoClick',
    'click .submit': 'onSubmitClick',
    'click #edit-place': 'onEditPlace'
  },

  // Override this with a schema for the actual form:
  schemata: {},

  initialize() {
    Teikei.vent.on('place:message:success', this.showSuccessMessage, this);
    Teikei.vent.on('place:message:failure', this.showFailureMessage, this);
  },

  onRender() {
    const $container = this.ui.placeMessageFormContainer;
    const ownercount = this.model.get('ownerships').length;
    const schemata = this.schemata();
    let forms = [];

    _.each(schemata, (schema, formId) => {
      let templateFile;

      if (formId !== 'placeMessageForm' || (formId === 'placeMessageForm' && ownercount > 0)) {
        templateFile = Marionette.Renderer.render(`places/details/${formId}`);
        const form = new Backbone.Form({
          model: this.model,
          schema: schema,
          template: _.template(templateFile)
        }).render();

        forms.push(form);
        form.$el.hide();
        $container.append(form.$el);
      } else {
        templateFile = Marionette.Renderer.render('places/details/placeMessageNoOwner');
        $container.append(_.template(templateFile));
      }
    }, this);

    _.defer(() => {
      forms[0].$el.show();
    });

    this.forms = forms;
    this.step = 0;
    this.bindUIElements();
  },

  onEditPlace(event) {
    event.preventDefault();
    Teikei.vent.trigger('edit:entry', this.model);
  },

  onSubmitClick(event) {
    event.preventDefault();

    const model = this.model;
    const forms = this.forms;
    const errors = forms[this.step].validate();
    const data = forms[this.step].getValue();

    if (errors === null) {
      this.hideAlertMessage(true);
      this.trigger('placeMessageForm:submit', {
        place_id: model.id,
        name: data.placeMessageName,
        email: data.placeMessageEmail,
        message: data.placeMessageMessage
      });
    }
  },

  showSuccessMessage(message) {
    this.showAlertMessage(message, 'success');
    const form = this.forms[this.step];
    this.clearForm(form);
  },

  clearForm(form) {
    form.setValue('placeMessageName', '');
    form.setValue('placeMessageEmail', '');
    form.setValue('placeMessageMessage', '');
  },

  showFailureMessage(xhr) {
    this.showError(xhr, I18n.t('forms.messages.sending_email_failed'));
  },

  onInfoTabClick(event) {
    event.preventDefault();
    this.ui.infoTab.addClass('active');
    this.ui.membershipTab.removeClass('active');
    this.ui.contactTab.removeClass('active');
    this.ui.infoPane.addClass('active');
    this.ui.membershipPane.removeClass('active');
    this.ui.contactPane.removeClass('active');
  },

  onContactTabClick(event) {
    event.preventDefault();
    this.ui.infoTab.removeClass('active');
    this.ui.membershipTab.removeClass('active');
    this.ui.contactTab.addClass('active');
    this.ui.infoPane.removeClass('active');
    this.ui.membershipPane.removeClass('active');
    this.ui.contactPane.addClass('active');
  },

  onMembershipTabClick(event) {
    event.preventDefault();
    this.ui.infoTab.removeClass('active');
    this.ui.membershipTab.addClass('active');
    this.ui.contactTab.removeClass('active');
    this.ui.infoPane.removeClass('active');
    this.ui.membershipPane.addClass('active');
    this.ui.contactPane.removeClass('active');
  },

  onMembershipPromoClick(event) {
    this.ui.membershipTab.click();
  }
});
