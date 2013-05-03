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

    initialize: function(controller) {
      App.vent.on("user:signin:success", this.hideForm, this);
      App.vent.on("user:signin:fail", this.showAuthenticationError, this);
      App.vent.on("user:signup:success", this.hideForm, this);
      App.vent.on("user:signup:fail", this.showRegistrationError, this);
    },

    onRender: function() {
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
    },

    onKeyPress: function(event) {
      // Enter pressed?
      if (event.which == 10 || event.which == 13) {
        inputFieldId = '#' + event.target.id;
        if (this.ui.signInForm.find(inputFieldId).length) {
          this.ui.signInForm.trigger("submit");
        }
        else if (this.ui.signUpForm.find(inputFieldId).length) {
          this.ui.signUpForm.trigger("submit");
        }
      }
    },

    onSignInTabClick: function(event) {
      event.preventDefault();
      this.hideAlertMessage(true);
      this.trigger("signin:tab:click");
    },

    onSignUpTabClick: function(event) {
      event.preventDefault();
      this.hideAlertMessage(true);
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

    showSignInForm: function(event) {
      this.hideAlertMessage(true);
      this.$el.reveal();
      this.activateSignInTab();
      this.activateSignInPane();
    },

    showSignUpForm: function(event) {
      this.hideAlertMessage(true);
      this.$el.reveal();
      this.activateSignUpTab();
      this.activateSignUpPane();
    },

    hideForm: function() {
      userName = this.model.get("userName");
      if (userName !== null && userName !== undefined) {
        message = "Successfully signed in as " + userName;
        // TODO Show message.
      }
      this.$el.trigger("reveal:close");
    },

    activateSignInTab: function(event) {
      // Need to talk to parent dd element in template
      this.ui.signUpTab.parent().removeClass("active");
      this.ui.signInTab.parent().addClass("active");
    },

    activateSignUpTab: function(event) {
      // Need to talk to parent dd element in template
      this.ui.signInTab.parent().removeClass("active");
      this.ui.signUpTab.parent().addClass("active");
    },

    activateSignInPane: function(event) {
      this.ui.signUpPane.removeClass("active");
      this.ui.signInPane.addClass("active");
    },

    activateSignUpPane: function(event) {
      this.ui.signInPane.removeClass("active");
      this.ui.signUpPane.addClass("active");
    }

  });
});
