Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  User.LoginView = Marionette.ItemView.extend({

    className: "reveal-modal",
    template: "user/login",

    ui: {
      form: "form",
    },

    events: {
      "submit form": "onSubmit"
    },

    initialize: function(controller) {
      this.model = controller.model;
      App.vent.on("user:login:success", this.hideForm, this)
    },

    onRender: function() {
      this.form = new Backbone.Form({
        schema: {
          email: { type: "Text", validators: ["required", "email"], title: "E-Mail-Adresse" },
          password: { type: "Password", validators: ["required"], title: "Passwort" }
        }
      }).render();
      this.ui.form.prepend(this.form.el);
    },

    onSubmit: function(event) {
      event.preventDefault();
      var data = this.form.getValue();

      this.trigger("form:submit", {
        email: data.email,
        password: data.password
      });
    },

    showForm: function(event) {
      this.$el.reveal();
    },

    hideForm: function(event) {
      this.$el.trigger("reveal:close");
    }

  });
});
