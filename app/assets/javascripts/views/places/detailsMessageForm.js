Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.DetailsMessageFormView = Places.DetailsView.extend({

    initialize: function(options) {
      Places.DetailsView.prototype.initialize.apply(this, arguments);
    },

    schemata: function() {
      return {
        placeMessageForm: {
          placeMessageName: { type: "Text", title: "Vorname Nachname", validators: ["required", { type: "minlength", min: 5 }], editorAttrs: { maxLength: 60 } },
          placeMessageEmail: { type: "Text", title: "E-Mail-Adresse", validators: ["required", "email"], editorAttrs: { maxLength: 100} },
          placeMessageMessage: { type: "TextArea", title: "Ihre Nachricht", validators: ["required", { type: "minlength", min: 6 }], editorAttrs: { maxLength: 300 } }
        }
      };
    }

  });
});
