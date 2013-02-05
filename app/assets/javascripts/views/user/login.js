Teikei.module("User", function(User, App, Backbone, Marionette, $, _) {

  User.LoginView = Marionette.ItemView.extend({

    className: "reveal-modal",
    template: "user/login",

    ui: {
      form: "form",
    },

    events: {
      "submit form": "onFormSubmit"
    },

    initialize: function(controller) {
      this.controller = controller;
      this.model = controller.model;
      App.vent.on("login", this.close, this)
    },

    onRender: function() {
      this.form = new Backbone.Form({
        schema: {
          email: { type: "Text", validators: ["required", "email"] },
          password: { type: "Password", validators: ["required"] }
        }
      }).render();
      this.ui.form.prepend(this.form.el);
    },

    onFormSubmit: function(event) {
      event.preventDefault();
      var data = this.form.getValue();

      this.controller.login({
        email: data.email,
        password: data.password
      });
    },

    open: function(event) {
      this.$el.reveal();
    },

    close: function(event) {
      this.$el.trigger("reveal:close");
    }

  });
});
