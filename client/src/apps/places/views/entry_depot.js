Places.EntryDepotView = Places.EntryView.extend({

  initialize(options) {
    this.model.set('type', 'Depot')
    Places.EntryView.prototype.initialize.apply(this, arguments)
  },

  onRender() {
    Places.EntryView.prototype.onRender.apply(this, arguments)
    this.preselectPlaces()
    this.preselectLocation()
  },

  preselectPlaces() {
    const form = this.forms[0]
    const data = this.model.get('places')
    const farms = new Entities.Places(data, {
      parse: true
    }).byType('Farm')
    const selection = farms.map(farm => {
      return farm.id
    })
    form.setValue('places', selection)
  },

  preselectLocation() {
    const form = this.forms[0]
    const data = {
      city: this.model.get('city'),
      address: this.model.get('address'),
      longitude: this.model.get('longitude'),
      latitude: this.model.get('latitude')
    }
    form.setValue('geocoder', data)
  },

  schemata() {
    const farms = Places.collection.byType('Farm')
    const farmOptions = farms.map(farm => {
      return {
        val: farm.id,
        label: `${farm.get('name')}, ${farm.get('city')}`
      }
    })

    return {
      entryDepotBasics: {
        places: {
          type: 'Select2',
          title: I18n.t('forms.labels.belongs_to_farm'),
          options: {
            values: farmOptions
          },
          editorAttrs: {
            multiple: 'multiple',
            placeholder: I18n.t('forms.placeholders.click_here')
          }
        },
        name: {
          type: 'Text',
          title: I18n.t('forms.labels.depot_name'),
          validators: ['required', {
            type: 'minlength',
            min: 5
          }],
          editorAttrs: {
            maxLength: 100,
            placeholder: I18n.t('forms.placeholders.depot_name')
          }
        },
        geocoder: {
          type: 'Geocoder',
          title: I18n.t('forms.labels.location'),
          validators: ['required'],
          markerType: 'depot'
        },
        description: {
          type: 'TextArea',
          title: I18n.t('forms.labels.depot_description'),
          editorAttrs: {
            placeholder: I18n.t('forms.placeholders.depot_description'),
            maxLength: 1000,
            rows: 8
          }
        },
        delivery_days: {
          type: 'TextArea',
          title: I18n.t('forms.labels.delivery_days')
        }
      },

      entryDepotContact: {
        contact_by_email: {
          type: 'Checkbox',
          title: I18n.t('forms.labels.contact_by_email')
        },
        contact_by_phone: {
          type: 'Checkbox',
          title: I18n.t('forms.labels.contact_by_phone')
        }
      }
    }
  }
})
