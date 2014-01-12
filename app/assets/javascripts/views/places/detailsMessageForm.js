Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.DetailsMessageFormView = Places.DetailsView.extend({

    schemata: function() {
      return {
        placeMessageForm: {
          placeMessageName: { type: "Text", title: "Vorname und Nachname", validators: ["required", { type: "minlength", min: 5 }], editorAttrs: { maxLength: 60 } },
          placeMessageEmail: { type: "Text", title: "E-Mail-Adresse", validators: ["required", "email"], editorAttrs: { maxLength: 100} },
          placeMessageMessage: { type: "TextArea", title: "Deine Nachricht", validators: ["required", { type: "minlength", min: 6 }], editorAttrs: { maxLength: 300 } }
        }
      };
    }

  });
});
