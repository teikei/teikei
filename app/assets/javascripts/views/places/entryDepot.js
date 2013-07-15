Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.EntryDepotView = Places.EntryView.extend({

    initialize: function(options) {
      this.model.set("type", "Depot");
      Places.EntryView.prototype.initialize.apply(this, arguments);
    },

    schemata: function() {
      var farms = this.collection.byType("Farm");
      var farmOptions = farms.map(function(farm){
        return {
          val: farm.id,
          label: farm.get("name") + ", " + farm.get("city")
        };
      });

      // Prepare places selection:
      // Extract farm ids from associated places.
      var associatedPlaces = this.model.attributes.places;
      console.log("Found " + associatedPlaces.length + " associated place(s).");
      var associatedFarmIds = [];
      _.each(associatedPlaces, function(item) {
        var associatedPlace = item.place;
        if (associatedPlace.type === "Farm") {
          associatedFarmIds.push(associatedPlace.id);
        }
      });
      console.log("Found " + associatedFarmIds.length + " associated farm(s): " + associatedFarmIds);


      return {
        entryDepotBasics: {
          name: { type: "Text", title: "Name", validators: ["required", { type: "minlength", min: 5 }], editorAttrs: { maxLength: 60, placeholder: "Vorname Nachname" } },
          places: {
            type: 'Select2',
            title: "Gehört zu Betrieb",
            config: {
              multiple: true
            },
            options: {
              values: farmOptions,
              value: associatedFarmIds,
              initSelection: function (element, callback) {
                console.log("initSelection has been called. YEAH");
                var data = [];
                $(element.val().split(",")).each(function () {
                  data.push({id: this, text: this});
                });
                callback(data);
              }
            },
            validators: ["required"],
            editorAttrs: {
              'multiple': 'multiple',
              placeholder: "Hier klicken oder schreiben ..."
            }
          },
          address: { type: "Text", title: "Straße und Hausnummer", validators: ["required", { type: "minlength", min: 6 }], editorAttrs: { maxLength: 40 } },
          city: { type: "Text", title: "PLZ und Ort", validators: ["required", { type: "minlength", min: 2 }], editorAttrs: { maxLength: 40 } },
          description: { type: "TextArea", title: "Beschreibung" }
        },

        entryDepotContact: {
          contact_name: { type: "Text", title: "Name", validators: ["required", { type: "minlength", min: 2 }], editorAttrs: { maxLength: 60 } },
          contact_email: { type: "Text", title: "Email", validators: ["required", "email"], editorAttrs: { maxLength: 100} },
          contact_phone: { type: "Text", title: "Telefonnummer", validators: ["required", "phonenumber"] }
        }
      };
    }

  });
});
