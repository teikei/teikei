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

    schemata: function() {

      // Add custom editor
      Backbone.Form.editors.Geocoder = App.Geocoder.FormEditor;

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
              maxLength: 60
            }
          },
          geocoder: {
            type: "Geocoder",
            title: "Standort des Betriebs",
            validators: ["required"]
          }
        },

        entryFarmDetails: {
          vegetable_products: {
            type: "Checkboxes",
            title: "Pflanzliche Produkte",
            options: App.labels.vegetable_products
          },
          animal_products: {
            type: "Checkboxes",
            title: "Tierische Produkte",
            options: App.labels.animal_products
          },
          beverages: {
            type: "Checkboxes",
            title: "Getränke",
            options: App.labels.beverages
          },
          additional_product_information: {
            type: "TextArea",
            title: "Zusätzliche Informationen zum Lebensmittelangebot"
          },
          description: {
            type: "TextArea",
            title: "Beschreibung",
            validators: ["required"]
          },
          founded_at_year: {
            type: "Select",
            title: "Solidarische Landwirtschaft seit (Jahr)",
            validators: ["required", "integer"],
            options: _.range(this.currentYear, this.currentYear - 100, -1)
          },
          founded_at_month: {
            type: "Select",
            title: "Solidarische Landwirtschaft seit (Monat)",
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
            type: "Text",
            title: "Erläuterungen zur Wirtschaftsweise",
            validators: ["required"]
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
            type: "Text",
            title: "Maximale Mitgliederzahl",
            validators: ["required", "integer"]
          },
          participation: {
            type: "TextArea",
            title: "Wie können sich die Mitglieder aktiv einbringen?",
            validators: ["required"]
          }
        },

        entryFarmContact: {
          contact_name: {
            type: "Text",
            title: "Vorname Nachname",
            validators: ["required", {
              type: "minlength",
              min: 2
            }],
            editorAttrs: {
              maxLength: 60
            }
          },
          contact_function: {
            type: "Text",
            title: "Funktion",
            editorAttrs: {
              maxLength: 60
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
            editorAttrs: {
              maxLength: 60
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
