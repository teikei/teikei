Places.EntryView = Base.ItemView.extend({

  className: 'entry-view',
  template: 'places/entry',

  ui: {
    headline: '.headline',
    formContainer: '.forms',
    nextButton: '.next',
    prevButton: '.prev',
    submitButton: '.submit',
    cityInput: '.city input',
    addressInput: '.address input',
    previewMap: '.preview-map',
    previewMarker: '.preview-marker',
    previewButton: '.preview-button'
  },

  events: {
    'click .next': 'onNextClick',
    'click .prev': 'onPrevClick',
    'click .submit': 'onSubmitClick'
  },

  placeholderSource: '/assets/preview-placeholder.png',

  // Override this with a schema for the actual form:
  schemata: {},

  initialize(options) {
    this.headline = options.headline
  },

  updateUi() {
    this.bindUIElements()
    this.ui.headline.text(this.headline)
    const currentForm = this.forms[this.step].$el
    this.focusFirstFormField(currentForm)

    let step = this.step
    const length = this.forms.length - 1

    if (step >= length) {
      this.ui.nextButton.hide()
      this.ui.prevButton.show()
      this.ui.submitButton.show()
    } else if (step <= 0) {
      this.ui.nextButton.show()
      this.ui.prevButton.hide()
      this.ui.submitButton.hide()
    } else {
      this.ui.nextButton.show()
      this.ui.prevButton.show()
      this.ui.submitButton.hide()
    }
  },

  onRender() {
    const $container = this.ui.formContainer
    const schemata = this.schemata()
    let forms = []

    _.each(schemata, (schema, formId) => {
      const ownerships = this.model.get('ownerships')
      let owner
      if (ownerships.length > 0) {
        owner = ownerships[0]
      } else {
        const current = Teikei.currentUser
        owner = {
          name: current.get('name'),
          phone: current.get('phone'),
          email: current.get('email')
        }
      }
      const data = {
        owner
      }
      const templateFile = Marionette.Renderer.render(`places/forms/${formId}`, data)
      const form = new Backbone.Form({
        model: this.model,
        schema,
        template: _.template(templateFile)
      }).render()

      forms.push(form)
      form.$el.hide()
      $container.append(form.$el)
    }, this)

    _.defer(() => {
      forms[0].$el.show()
    })

    this.forms = forms
    this.step = 0
    this.updateUi()
  },

  onNextClick() {
    const forms = this.forms
    const errors = forms[this.step].validate()
    if (errors === null) {
      this.forms[this.step].$el.hide()
      this.forms[++this.step].$el.show()
      this.updateUi()
    }
  },

  onPrevClick() {
    this.forms[this.step].$el.hide()
    this.forms[--this.step].$el.show()
    this.updateUi()
  },

  onSubmitClick(event) {
    const self = this
    const model = this.model
    const errors = this.forms[this.step].validate()

    if (errors === null) {
      this.hideAlertMessage(true)
      _.each(this.forms, form => {
        const value = form.getValue()

        // flatten geocoder attributes
        if (value.hasOwnProperty('geocoder')) {
          _.extend(value, value.geocoder)
          delete value.geocoder
        }

        model.set(value)
      })

      // initialize computed property
      const places = model.get('places')
      if (places) {
        model.set('related_places_count', places.length)
      }

      model.save({}, {
        success(model, response, options) {
          self.closeView()
          Teikei.vent.trigger('place:added', model)
          Alert.renderPlaceCreateSuccess(model)
        },
        error(model, xhr, options) {
          self.showAuthorizationError(xhr)
        }
      })
    }
  },

  showAuthorizationError(xhr) {
    this.showError(xhr, I18n.t('forms.messages.unauthorized'))
  }

})
