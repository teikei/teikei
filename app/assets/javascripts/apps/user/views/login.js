Teikei.module("User", function(User, Teikei, Backbone, Marionette, $, _) {

  User.LoginView = Teikei.Base.ItemView.extend({

    className: "login-view",
    template: "user/login",

    ui: {
      signInForm: "#signin-form",
      signUpForm: "#signup-form",
      signInTab: "#signin-tab",
      signUpTab: "#signup-tab",
      signInPane: "#signin",
      signUpPane: "#signup"
    },

    events: {
      "submit #signin-form": "onSignInFormSubmit",
      "submit #signup-form": "onSignUpFormSubmit",
      "click #signin-tab": "onSignInClick",
      "click #signup-tab": "onSignUpClick",
      "click #signin-link": "onSignInClick",
      "click #signup-link": "onSignUpClick",
      "keypress input": "onKeyPress"
    },

    initialize: function() {
      this.listenTo(Teikei.vent, "user:signin:success", this.showAuthenticationConfirmation);
      this.listenTo(Teikei.vent, "user:signin:fail", this.showAuthenticationError);
      this.listenTo(Teikei.vent, "user:signup:success", this.showRegistrationConfirmation);
      this.listenTo(Teikei.vent, "user:signup:fail", this.showRegistrationError);
    },

    onRender: function() {
      var view = this;
      var $el = this.$el;

      this.signInForm = new Backbone.Form({
        schema: {
          signInEmail: { type: "Text", title: "Email",
            validators: ["required", "email"], editorAttrs: { maxLength: 100 }
          },
          signInPassword: { type: "Password", title: "Passwort",
            validators: ["required", { type: "minlength", min: 6 }], editorAttrs: { maxLength: 100 }
          }
        }
      }).render();
      this.ui.signInForm.prepend(this.signInForm.el);

      this.signUpForm = new Backbone.Form({
        schema: {
          signUpName: { type: "Text", title: "Vorname und Nachname",
            validators: ["required"]
          },
          signUpEmail: { type: "Text", title: "Email", labelFor: "email",
            validators: ["required", "email"], editorAttrs: { maxLength: 100 }
          },
          signUpPassword: { type: "Password", title: "Passwort",
            validators: ["required", { type: "minlength", min: 6 }], editorAttrs: { maxLength: 100 }
          },
          signUpPasswordConfirmation: { type: "Password", title: "Passwort-Wiederholung",
            validators: ["required", { type: 'match', field: 'signUpPassword'}, { type: "minlength", min: 6 }], editorAttrs: { maxLength: 100 }
          }
        }
      }).render();
      this.ui.signUpForm.prepend(this.signUpForm.el);
      this.focusFirstFormField(this.ui.signInForm);
    },

    onEnterKeyPressed: function(event) {
      var inputFieldId = '#' + event.target.id;
      if (this.ui.signInForm.find(inputFieldId).length) {
        this.ui.signInForm.trigger("submit");
      }
      else if (this.ui.signUpForm.find(inputFieldId).length) {
        this.ui.signUpForm.trigger("submit");
      }
    },

    onSignInClick: function(event) {
      event.preventDefault();
      this.hideAlertMessage(true);
      this.showSignInForm();
      this.trigger("signin:tab:click");
    },

    onSignUpClick: function(event) {
      event.preventDefault();
      this.hideAlertMessage(true);
      this.showSignUpForm();
      this.trigger("signup:tab:click");
    },

    onSignInFormSubmit: function(event) {
      event.preventDefault();
      var errors = this.signInForm.validate();
      var data = this.signInForm.getValue();

      if (errors === null) {
        this.hideAlertMessage(true);
        this.trigger("signInForm:submit", {
          email: data.signInEmail,
          password: data.signInPassword
        });
      }
    },

    onSignUpFormSubmit: function(event) {
      event.preventDefault();
      var errors = this.signUpForm.validate();
      var data = this.signUpForm.getValue();

      if (errors === null) {
        this.hideAlertMessage(true);
        this.trigger("signUpForm:submit", {
          name: data.signUpName,
          email: data.signUpEmail,
          password: data.signUpPassword,
          password_confirmation: data.signUpPasswordConfirmation
        });
      }
    },

    showRegistrationConfirmation: function(model) {
      Teikei.Alert.renderSignUpStatus(model);
      this.closeView();
    },

    showAuthenticationConfirmation: function(model) {
      Teikei.Alert.renderSignInSuccess(model);
      this.closeView();
    },

    showAuthenticationError: function(xhr) {
      this.showError(xhr, "Anmeldung fehlgeschlagen!");
    },

    showRegistrationError: function(xhr) {
      this.showError(xhr, "Registrierung fehlgeschlagen!");
    },

    showSignInForm: function(event) {
      this.hideAlertMessage(true);
      this.activateSignInTab();
      this.activateSignInPane();
      this.focusFirstFormField(this.ui.signInForm);
    },

    showSignUpForm: function(event) {
      this.hideAlertMessage(true);
      this.activateSignUpTab();
      this.activateSignUpPane();
      this.focusFirstFormField(this.ui.signUpForm);
    },

    activateSignInTab: function() {
      this.activateTab(this.ui.signInTab,
                       new Array(this.ui.signUpTab)
                      );
    },

    activateSignUpTab: function() {
      this.activateTab(this.ui.signUpTab,
                       new Array(this.ui.signInTab)
                      );
    },

    activateSignInPane: function() {
      this.activatePane(this.ui.signInPane,
                        new Array(this.ui.signUpPane)
                       );
    },

    activateSignUpPane: function() {
      this.activatePane(this.ui.signUpPane,
                        new Array(this.ui.signInPane)
                       );
    }

  });
});
