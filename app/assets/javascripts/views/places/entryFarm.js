Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

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

      // Add custom editors
      Backbone.Form.editors.Geocoder = App.Geocoder.FormEditor;
      Backbone.Form.editors.FileUpload = App.FileUpload.FormEditor;


      function validateNumber(min, max) {
        return function(val) {
          if (val < min || val > max) {
            return {
              type: "invalid number",
              message: "Erlaubt ist eine Anzahl von "+min+" bis "+max+"."
            };
          }
        };
      }

      return {
        entryFarmBasics: {
          name: {
            type: "Text",
            title: "Name des Hofs",
            validators: ["required", {
              type: "minlength",
              min: 5
            }],
            editorAttrs: {
              maxLength: 100
            }
          },
          geocoder: {
            type: "Geocoder",
            title: "Standort des Betriebs",
            validators: ["required"],
            markerType: "farm"
          },
          image: {
            type: "FileUpload",
            title: "Bild des Betriebs"
          }
        },

        entryFarmDetails: {
          description: {
            type: "TextArea",
            title: "Beschreibung des Betriebs",
            editorAttrs: {
              placeholder: 'z.B. Informationen zum Hintergrund, zu den Betreibern oder zur Geschichte des Betriebs.',
              maxLength: 1000,
              rows: 8
            }
          },
          vegetable_products: {
            type: "Checkboxes",
            title: "Pflanzliche Produkte",
            options: App.labels.vegetable_products_long
          },
          animal_products: {
            type: "Checkboxes",
            title: "Tierische Produkte",
            options: App.labels.animal_products_long
          },
          beverages: {
            type: "Checkboxes",
            title: "Getränke",
            options: App.labels.beverages
          },
          additional_product_information: {
            type: "TextArea",
            title: "Zusätzliche Informationen zum Lebensmittelangebot",
            editorAttrs: {
              placeholder: 'z.B. Informationen zu besonderen Sorten, Sonderkulturen, verarbeiteten Lebensmitteln o.ä.',
              maxLength: 1000,
              rows: 6
            }
          },
          founded_at_year: {
            type: "Select",
            title: "Solidarische Landwirtschaft seit bzw. ab (Jahr)",
            validators: ["integer"],
            options: _.range(this.currentYear + 1, this.currentYear - 100, -1)
          },
          founded_at_month: {
            type: "Select",
            title: "Solidarische Landwirtschaft seit bzw. ab (Monat)",
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
            title: "Wir wirtschaften ökologisch"
          },
          economical_behavior: {
            type: "TextArea",
            title: "Erläuterungen zur Wirtschaftsweise",
            editorAttrs: {
              placeholder: 'z.B. Mitgliedschaft in Anbauverbänden o.ä.',
              maxLength: 1000,
              rows: 6
            }
          }
        },

        entryFarmMembership: {
          accepts_new_members: {
            type: "Radio",
            title: "Wir haben noch freie Kapazitäten und suchen neue Mitglieder",
            options: [{
              label: "Ja",
              val: "yes"
            }, {
              label: "Nein",
              val: "no"
            }, {
              label: "Warteliste",
              val: "waitlist"
            }]
          },
          maximum_members: {
            type: "Number",
            title: "Maximale Mitgliederzahl",
            validators: [validateNumber(0, 500)]
          },
          participation: {
            type: "TextArea",
            title: "Wie können sich die Mitglieder aktiv einbringen?",
            editorAttrs: {
              maxLength: 1000,
              rows: 8
            }
          }
        },

        entryFarmContact: {
          contact_name: {
            type: "Text",
            title: "Vorname Nachname",
            validators: ["required"],
            editorAttrs: {
              maxLength: 100
            }
          },
          contact_function: {
            type: "Text",
            title: "Funktion",
            editorAttrs: {
              maxLength: 100
            }
          },
          contact_email: {
            type: "Text",
            title: "Email",
            validators: ["required", "email"],
            editorAttrs: {
              maxLength: 100
            }
          },
          contact_url: {
            type: "Text",
            title: "Website",
            validators: ["url"],
            editorAttrs: {
              maxLength: 100
            }
          },
          contact_phone: {
            type: "Text",
            title: "Telefonnummer",
            validators: ["phonenumber"]
          }
        }
      };
    }

  });
});
