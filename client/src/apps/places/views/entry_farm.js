Places.EntryFarmView = Places.EntryView.extend({

  initialize: function(options) {
    this.model.set("type", "Farm");
    this.currentYear = (new Date()).getFullYear();
    Places.EntryView.prototype.initialize.apply(this, arguments);
  },

  onRender: function() {
    Places.EntryView.prototype.onRender.apply(this, arguments);
    this.preselectLocation();
    this.preselectImage();
  },

  preselectLocation: function() {
    var form = this.forms[0];
    var data = {
      city: this.model.get("city"),
      address: this.model.get("address"),
      longitude: this.model.get("longitude"),
      latitude: this.model.get("latitude")
    };
    form.setValue("geocoder", data);
  },

  preselectImage: function() {
    var form = this.forms[0];
    form.setValue("image", this.model.get("image"));
  },

  schemata: function() {

    function validateNumber(min, max) {
      return function(val) {
        if (val < min || val > max) {
          return {
            type: "invalid number",
            message: "Erlaubt ist eine Anzahl von " + min + " bis " + max + "."
          };
        }
      };
    }

    return {
      entryFarmBasics: {
        name: {
          type: "Text",
          title: I18n.t('forms.labels.farm_name'),
          validators: ["required", {
            type: "minlength",
            min: 5
          }],
          editorAttrs: {
            maxLength: 100
          }
        },
        url: {
          type: "Text",
          title: I18n.t('forms.labels.website'),
          validators: ["url"],
          editorAttrs: {
            maxLength: 100
          }
        },
        geocoder: {
          type: "Geocoder",
          title: I18n.t('forms.labels.location'),
          validators: ["required"],
          markerType: "farm"
        },
        image: {
          type: "FileUpload",
          title: I18n.t('forms.labels.farm_image')
        }
      },

      entryFarmDetails: {
        description: {
          type: "TextArea",
          title: I18n.t('forms.labels.farm_description'),
          editorAttrs: {
            placeholder: I18n.t('forms.placeholders.farm_description'),
            maxLength: 1000,
            rows: 8
          }
        },
        vegetable_products: {
          type: "Checkboxes",
          title: I18n.t('forms.labels.vegetable_products'),
          options: Teikei.labels.vegetable_products
        },
        animal_products: {
          type: "Checkboxes",
          title: I18n.t('forms.labels.animal_products'),
          options: Teikei.labels.animal_products
        },
        beverages: {
          type: "Checkboxes",
          title: I18n.t('forms.labels.beverages'),
          options: Teikei.labels.beverages
        },
        additional_product_information: {
          type: "TextArea",
          title: I18n.t('forms.labels.additional_product_information'),
          editorAttrs: {
            placeholder: I18n.t('forms.placeholders.additional_product_information'),
            maxLength: 1000,
            rows: 6
          }
        },
        founded_at_year: {
          type: "Select",
          title: I18n.t('forms.labels.founded_at_year'),
          validators: ["integer"],
          options: _.range(this.currentYear + 1, this.currentYear - 100, -1)
        },
        founded_at_month: {
          type: "Select",
          title: I18n.t('forms.labels.founded_at_month'),
          validators: ["integer"],
          options: [{
            label: "",
            val: ""
          }].concat(
            _.map(_.range(1, 13), function(month) {
              return {
                label: Backbone.Form.editors.Date.monthNames[month - 1],
                val: month
              };
            }))
        },
        acts_ecological: {
          type: "Checkbox",
          title: I18n.t('forms.labels.acts_ecological')
        },
        economical_behavior: {
          type: "TextArea",
          title: I18n.t('forms.labels.economical_behavior'),
          editorAttrs: {
            placeholder: I18n.t('forms.placeholders.economical_behavior'),
            maxLength: 1000,
            rows: 6
          }
        }
      },

      entryFarmMembership: {
        accepts_new_members: {
          type: "Radio",
          title: I18n.t('forms.labels.accepts_new_members'),
          options: [{
            label: I18n.t('forms.labels.available'),
            val: "yes"
          }, {
            label: I18n.t('forms.labels.not_available'),
            val: "no"
          }, {
            label: I18n.t('forms.labels.waitlist'),
            val: "waitlist"
          }]
        },
        maximum_members: {
          type: "Number",
          title: I18n.t('forms.labels.maximum_members'),
          validators: [validateNumber(0, 500)]
        },
        participation: {
          type: "TextArea",
          title: I18n.t('forms.labels.participation'),
          editorAttrs: {
            maxLength: 1000,
            rows: 8
          }
        }
      },

      entryFarmContact: {
        contact_by_email: {
          type: "Checkbox",
          title: I18n.t('forms.labels.contact_by_email')
        },
        contact_by_phone: {
          type: "Checkbox",
          title: I18n.t('forms.labels.contact_by_phone')
        },
        contact_function: {
          type: "Text",
          title: I18n.t('forms.labels.function'),
          editorAttrs: {
            maxLength: 100
          }
        }
      }
    };
  }
});
