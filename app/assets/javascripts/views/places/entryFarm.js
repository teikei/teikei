Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.EntryFarmView = Places.EntryView.extend({

    schemata: function() {
      return {
        entryFarmBasics: {
          name: { type: "Text", title: "Name des Hofs", validators: ["required"] },
          adress: { type: "Text", title: "Straße und Hausnummer", validators: ["required"] },
          city: { type: "Text", title: "PLZ und Ort", validators: ["required"] }
        },

        entryFarmMembership: {
          accepts_new_members: { type: "Radio", title: "Offen für neue Mitglieder?", options: ["Ja", "Nein"] },
          maximum_members: { type: "Text", title: "Maximale Mitgliederzahl" },
          founded_at: { type: "Text", title: "Gründungsjahr" },
          participation: { type: "Text", title: "Wie können sich die Mitglieder aktiv einbringen?" }
        },

        entryFarmDetails: {
          is_solawi_member: { type: "Radio", title: "Ist der Hof Mitglied im Netzwerk Solidarische Landwirtschaft?", options: ["Ja", "Nein"] },
          products: { type: "Text", title: "Erzeugnisse" },
          farming_standard: { type: "Text", title: "Anbaustandards" },
          description: { type: "Text", title: "Beschreibung" }
        },

        entryFarmContact: {
          contact_name: { type: "Text", title: "Name", validators: ["required"] },
          contact_email: { type: "Text", title: "Email", validators: ["required", "email"] },
          contact_phone: { type: "Text", title: "Telefonnummer", validators: ["required"] }
        }
      };
    }

  });
});
