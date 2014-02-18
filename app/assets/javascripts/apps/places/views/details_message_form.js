Teikei.module("Places", function(Places, Teikei, Backbone, Marionette, $, _) {

  Places.DetailsMessageFormView = Places.DetailsView.extend({

    schemata: function() {
      return {
        placeMessageForm: {
          placeMessageName: {
            type: "Text",
            title: "Vorname und Nachname",
            validators: ["required"],
            editorAttrs: {
              maxLength: 60
            }
          },
          placeMessageEmail: {
            type: "Text",
            title: "E-Mail-Adresse",
            validators: ["required", "email"],
            editorAttrs: {
              maxLength: 100
            }
          },
          placeMessageMessage: {
            type: "TextArea",
            title: "Deine Nachricht",
            validators: ["required"],
            editorAttrs: {
              maxLength: 1000,
              rows: 8
            }
          }
        }
      };
    }

  });
});
