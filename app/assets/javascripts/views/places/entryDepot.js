Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.EntryDepotView = Places.EntryView.extend({

    initialize: function(options) {
      this.model.set("type", "Depot");
      Places.EntryView.prototype.initialize.apply(this, arguments);
    },

    onRender: function() {
      Places.EntryView.prototype.onRender.apply(this, arguments);
      this.preselectPlaces();
      this.preselectLocation();
    },

    preselectPlaces: function() {
      var form = this.forms[0];
      var data = this.model.get("places");
      var farms = new Places.Collection(data, {
        parse: true
      }).byType("Farm");
      var selection = farms.map(function(farm) {
        return farm.id;
      });
      form.setValue("places", selection);
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
      var farms = this.collection.byType("Farm");
      var farmOptions = farms.map(function(farm) {
        return {
          val: farm.id,
          label: farm.get("name") + ", " + farm.get("city")
        };
      });

      // Add custom editor
      Backbone.Form.editors.Geocoder = App.Geocoder.FormEditor;

      return {
        entryDepotBasics: {
          places: {
            type: "Select2",
            title: "Gehört zu Betrieb",
            options: {
              values: farmOptions
            },
            editorAttrs: {
              multiple: "multiple",
              placeholder: "Hier klicken oder schreiben ..."
            }
          },
          name: {
            type: "Text",
            title: "Bezeichnung der Abholstelle",
            validators: ["required", {
              type: "minlength",
              min: 5
            }],
            editorAttrs: {
              maxLength: 60,
              placeholder: "z.B. Fröhliche Gärtnerei, Abholstelle Charlottenburg"
            }
          },
          geocoder: {
            type: "Geocoder",
            title: "Standort eingeben",
            validators: ["required"],
            markerType: "depot"
          },
          delivery_days: {
            type: "TextArea",
            title: "Abholtage"
          }
        },

        entryDepotContact: {
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
          contact_email: {
            type: "Text",
            title: "Email",
            validators: ["required", "email"],
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
