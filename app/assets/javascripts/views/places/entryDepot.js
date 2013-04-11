Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  var farms = [];

  App.vent.on("places:change", function(places){
    farms = places.map(function(place){
      return place.get("name") + ", " + place.get("city");
    });
  });

  Places.EntryDepotView = Places.EntryView.extend({

    schemata: function() {
      return {
        entryDepotBasics: {
          name: { type: "Text", title: "Name des Depots (optional)" },
          farm: { type: 'Select', options: farms },
          adress: { type: "Text", title: "Straße und Hausnummer", validators: ["required"] },
          city: { type: "Text", title: "PLZ und Ort", validators: ["required"] }
        },

        entryDepotContact: {
          contact_name: { type: "Text", title: "Name", validators: ["required"] },
          contact_email: { type: "Text", title: "Email", validators: ["required", "email"] },
          contact_phone: { type: "Text", title: "Telefonnummer", validators: ["required"] }
        }
      };
    }

  });
});
