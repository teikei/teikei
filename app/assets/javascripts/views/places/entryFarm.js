Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.EntryFarmView = Places.EntryView.extend({

    initialize: function(options) {
      this.model.set("type", "Farm");
      this.currentYear= (new Date()).getFullYear();
      Places.EntryView.prototype.initialize.apply(this, arguments);
    },

    schemata: function() {
      return {
        entryFarmBasics: {
          name: { type: "Text", title: "Name des Hofs", validators: ["required", { type: "minlength", min: 5 }], editorAttrs: { maxLength: 60 } },
          address: { type: "Text", title: "Straße und Hausnummer", validators: ["required", { type: "minlength", min: 6 }], editorAttrs: { maxLength: 40 } },
          city: { type: "Text", title: "PLZ und Ort", validators: ["required", { type: "minlength", min: 2 }], editorAttrs: { maxLength: 40 } }
        },
        entryFarmDetails: {
          products: { type: "Checkboxes", title: "Erzeugnisse", validators: ["selectionrequired"],
            options: App.labels.products
          },
          description: { type: "TextArea", title: "Beschreibung", validators: ["required"] },
          founded_at_year: { type: "Select", title: "Solidarische Landwirtschaft seit (Jahr)", validators: ["required", "integer"],
            options: _.range(this.currentYear, this.currentYear - 100, -1)
          },
          founded_at_month: { type: "Select", title: "Solidarische Landwirtschaft seit (Monat)", validators: ["integer"],
            options: [{ label: "", val: "" }].concat(
              _.map(_.range(1, 13), function(month) {
              return{ label: Backbone.Form.editors.Date.monthNames[month - 1], val: month};
            }))
          },
          farming_standard: { type: "Select", title: "Anbaustandard", validators: ["required"],
            options: App.labels.farming_standards
          },
          is_solawi_member: { type: "Checkbox", title: "Der Betrieb ist Mitglied im Netzwerk Solidarische Landwirtschaft" }
        },
        entryFarmMembership: {
          accepts_new_members: { type: "YesNoCheckbox", title: "Wir haben noch freie Kapazität und suchen neuen Mitglieder" },
          maximum_members: { type: "Text", title: "Maximale Mitgliederzahl", validators: ["required", "integer"] },
          participation: { type: "TextArea", title: "Wie können sich die Mitglieder aktiv einbringen?", validators: ["required"]}
        },
        entryFarmContact: {
          contact_name: { type: "Text", title: "Name", validators: ["required", { type: "minlength", min: 2 }], editorAttrs: { maxLength: 60 } },
          contact_function: { type: "Text", title: "Funktion", editorAttrs: { maxLength: 60 } },
          contact_email: { type: "Text", title: "Email", validators: ["required", "email"], editorAttrs: { maxLength: 100} },
          contact_url: { type: "Text", title: "Website", validators: ["url"], editorAttrs: { maxLength: 60} },
          contact_phone: { type: "Text", title: "Telefonnummer", validators: ["phonenumber"] }
        }
      };
    }

  });
});
