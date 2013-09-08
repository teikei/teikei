Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.EntryDepotView = Places.EntryView.extend({

    initialize: function(options) {
      this.model.set("type", "Depot");
      Places.EntryView.prototype.initialize.apply(this, arguments);
    },

    onRender: function() {
      Places.EntryView.prototype.onRender.apply(this, arguments);
      this.preselectPlaces();
    },

    preselectPlaces: function() {
      var form = this.forms[0];
      var data = this.model.get("places");
      var farms = new Places.Collection(data, {parse: true}).byType("Farm");
      var selection = farms.map(function(farm){
        return farm.id;
      });
      form.setValue("places", selection);
    },

    schemata: function() {
      var farms = this.collection.byType("Farm");
      var farmOptions = farms.map(function(farm){
        return {
          val: farm.id,
          label: farm.get("name") + ", " + farm.get("city")
        };
      });

      return {
        entryDepotBasics: {
          name: { type: "Text", title: "Name", validators: ["required", { type: "minlength", min: 5 }], editorAttrs: { maxLength: 60, placeholder: "Vorname Nachname" } },
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
