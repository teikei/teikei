Teikei.module('Places', function(Places, App, Backbone, Marionette, $, _) {

  // Map Model
  // ----------

  Places.Model = Backbone.Model.extend({

    urlRoot: function(){
      var type = this.get("type").toLowerCase();
      var query = "/api/v1/{type}s/";
      return query.replace("{type}", type);
    },

    defaults: {
      name: "",
      type: "",
      farming_standard: "",
      accepts_new_members: null,
      address: "",
      city: "",
      contact_email: "",
      contact_name: "",
      contact_phone: "",
      description: "",
      is_established: null,
      latitude: "",
      longitude: "",
      places: [],
      founded_at: "",
      maximum_members: null,
      participation: "",
      products: "",
      user_id: null
    },

    schema: {
      name: { type: "Text", title: "Name des Hofs", validators: ["required"] },
      type: { type: 'Select', options: ["Farm", "Depot"] },
      adress: { type: "Text", title: "Straße und Hausnummer", validators: ["required"] },
      city: { type: "Text", title: "PLZ und Ort", validators: ["required"] },

      contact_name: { type: "Text", title: "Name", validators: ["required"] },
      contact_email: { type: "Text", title: "Email", validators: ["required", "email"] },
      contact_phone: { type: "Text", title: "Telefonnummer", validators: ["required"] },

      accepts_new_members: { type: "Radio", title: "Offen für neue Mitglieder?", options: ["Ja", "Nein"] },
      maximum_members: { type: "Text", title: "Maximale Mitgliederzahl" },
      founded_at: { type: "Text", title: "Gründungsjahr" },
      participation: { type: "Text", title: "Wie können sich die Mitglieder aktiv einbringen?" }
    }

  });

});
