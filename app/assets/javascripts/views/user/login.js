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
      "submit form": "onSubmit",
      "click #signin-tab": "activateSignInPane",
      "click #signup-tab": "activateSignUpPane"
    },

    initialize: function(controller) {
      App.vent.on("user:login:success", this.hideForm, this);
      App.vent.on("user:login:fail", this.showAuthError, this);
    },

    onRender: function() {
      this.signInForm = new Backbone.Form({
        schema: {
          email: { type: "Text", validators: ["required", "email"], title: "E-Mail-Addresse" },
          password: { type: "Password", validators: ["required"], title: "Passwort" }
        }
      }).render();
      this.ui.signInForm.prepend(this.signInForm.el);
    },

    onSubmit: function(event) {
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
