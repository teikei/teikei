Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  User.LoginView = Teikei.Base.ItemView.extend({

    className: "reveal-modal",
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
      "click #signin-tab": "onSignInTabClick",
      "click #signup-tab": "onSignUpTabClick",
      "keypress input": "onKeyPress"
    },

    initialize: function() {
      App.vent.on("user:signin:success", this.hideForm, this);
      App.vent.on("user:signin:fail", this.showAuthenticationError, this);
      App.vent.on("user:signup:success", this.hideForm, this);
      App.vent.on("user:signup:fail", this.showRegistrationError, this);
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
            validators: ["required", { type: "minlength", min: 6 }], editorAttrs: { maxLength: 40 }
          }
        }
      }).render();
      this.ui.signInForm.prepend(this.signInForm.el);

      this.signUpForm = new Backbone.Form({
        schema: {
          signUpName: { type: "Text", title: "Vorname Nachname",
            validators: ["required"]
          },
          signUpEmail: { type: "Text", title: "Email", labelFor: "email",
            validators: ["required", "email"], editorAttrs: { maxLength: 100 }
          },
          signUpPassword: { type: "Password", title: "Passwort",
            validators: ["required", { type: "minlength", min: 6 }], editorAttrs: { maxLength: 40 }
          },
          signUpPasswordConfirmation: { type: "Password", title: "Passwort-Wiederholung",
            validators: ["required", { type: 'match', field: 'signUpPassword'}, { type: "minlength", min: 6 }], editorAttrs: { maxLength: 40 }
          }
        }
      }).render();
      this.ui.signUpForm.prepend(this.signUpForm.el);

      _.defer(function(){
        $el.reveal({
          closeOnBackgroundClick: false,
          closed: function(){
            view.trigger("reveal:closed");
          }
        });
      });
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

    onSignInTabClick: function(event) {
      event.preventDefault();
      this.hideAlertMessage(true);
      this.showSignInForm();
      this.trigger("signin:tab:click");
    },

    onSignUpTabClick: function(event) {
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
    },

    showSignUpForm: function(event) {
      this.hideAlertMessage(true);
      this.activateSignUpTab();
      this.activateSignUpPane();
    },

    hideForm: function() {
      var userName = this.model.get("name");
      if (userName !== null && userName !== undefined) {
        message = "Successfully signed in as " + userName;
        // TODO Show message.
      }
      this.$el.trigger("reveal:close");
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
