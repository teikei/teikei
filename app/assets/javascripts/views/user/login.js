Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  User.LoginView = Marionette.ItemView.extend({

    className: "reveal-modal",
    template: "user/login",

    ui: {
      signInForm: "#signin-form",
      signUpForm: "#signup-form",
      signInPane: "#signin-pane",
      signUpPane: "#signup-pane"
    },

    events: {
      "submit #signin-form": "onSignInFormSubmit",
      "submit #signup-form": "onSignUpFormSubmit",
      "click #signin-tab": "activateSignInPane",
      "click #signup-tab": "activateSignUpPane"
    },

    initialize: function(controller) {
      App.vent.on("user:signin:success", this.hideForm, this);
      App.vent.on("user:signin:fail", this.showAuthError, this);
      App.vent.on("user:signup:success", this.hideForm, this);
      App.vent.on("user:signup:fail", this.showAuthError, this);
    },

    onRender: function() {
      this.signInForm = new Backbone.Form({
        schema: {
          email: { type: "Text", title: "Email",
            validators: ["required", "email"], editorAttrs: { maxLength: 100 }
          },
          password: { type: "Password", title: "Passwort",
            validators: ["required", { type: "minlength", min: 6 }], editorAttrs: { maxLength: 40 }
          }
        }
      }).render();
      this.ui.signInForm.prepend(this.signInForm.el);

      this.signUpForm = new Backbone.Form({
        schema: {
          name: { type: "Text", title: "Vorname Nachname",
            validators: ["required"]
          },
          email: { type: "Text", title: "Email",
            validators: ["required", "email"], editorAttrs: { maxLength: 100 }
          },
          password: { type: "Password", title: "Passwort",
            validators: ["required", { type: "minlength", min: 6 }], editorAttrs: { maxLength: 40 }
          },
          passwordConfirmation: { type: "Password", title: "Passwort-Wiederholung",
            validators: ["required", { type: 'match', field: 'password'}, { type: "minlength", min: 6 }], editorAttrs: { maxLength: 40 }
          }
        }
      }).render();

      this.ui.signUpForm.prepend(this.signUpForm.el);
    },

    onSignInFormSubmit: function(event) {
      event.preventDefault();
      var errors = this.signInForm.validate();
      var data = this.signInForm.getValue();

      if (errors === null) {
        this.hideAuthError();
        this.trigger("signInForm:submit", {
          email: data.email,
          password: data.password
        });
      }
    },

    onSignUpFormSubmit: function(event) {
      event.preventDefault();
      var errors = this.signUpForm.validate();
      var data = this.signUpForm.getValue();

      if (errors === null) {
        this.hideAuthError();
        this.trigger("signUpForm:submit", {
          name: data.name,
          email: data.email,
          password: data.password,
          password_confirmation: data.passwordConfirmation
        });
      }
    },

    showAuthError: function(event) {
      if (this.alert) {
        this.alert.fadeIn();
      }
      else {
        this.alert = $("<div class='alert-box alert'>Anmeldung fehlgeschlagen!</div>");
        this.$el.append(this.alert);
      }
    },

    hideAuthError: function(event) {
      if (this.alert) {
        this.alert.fadeOut();
      }
    },

    showForm: function(event) {
      this.$el.reveal();
    },

    hideForm: function(event) {
      this.$el.trigger("reveal:close");
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
