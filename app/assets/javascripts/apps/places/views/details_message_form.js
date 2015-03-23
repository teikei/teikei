Teikei.module("Places", function(Places, Teikei, Backbone, Marionette, $, _) {

  Places.DetailsMessageFormView = Places.DetailsView.extend({

    schemata: function() {
      return {
        placeMessageForm: {
          placeMessageName: {
            type: "Text",
            title: I18n.t("forms.labels.full_name"),
            validators: ["required"],
            editorAttrs: {
              maxLength: 60
            }
          },
          placeMessageEmail: {
            type: "Text",
            title: I18n.t("forms.labels.email"),
            validators: ["required", "email"],
            editorAttrs: {
              maxLength: 100
            }
          },
          placeMessageMessage: {
            type: "TextArea",
            title: I18n.t("forms.labels.your_message"),
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
