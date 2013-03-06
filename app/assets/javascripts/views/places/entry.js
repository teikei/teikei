Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.EntryView = Marionette.ItemView.extend({

    className: "reveal-modal large",
    template: "places/entry",

    ui: {
      formContainer: ".forms",
      nextButton: ".next",
      prevButton: ".prev",
      submitButton: ".submit"
    },

    events: {
      "click .next": "onNextClick",
      "click .prev": "onPrevClick",
      "click .submit": "onSubmitClick"
    },

    schemata: {

      basics: {
        name: { type: "Text", title: "Name des Hofs", validators: ["required"] },
        type: { type: 'Select', options: ["Farm", "Depot"] },
        adress: { type: "Text", title: "Straße und Hausnummer", validators: ["required"] },
        city: { type: "Text", title: "PLZ und Ort", validators: ["required"] }
      },

      details: {
        accepts_new_members: { type: "Radio", title: "Offen für neue Mitglieder?", options: ["Ja", "Nein"] },
        maximum_members: { type: "Text", title: "Maximale Mitgliederzahl" },
        founded_at: { type: "Text", title: "Gründungsjahr" },
        participation: { type: "Text", title: "Wie können sich die Mitglieder aktiv einbringen?" }
      },

      contact: {
        contact_name: { type: "Text", title: "Name", validators: ["required"] },
        contact_email: { type: "Text", title: "Email", validators: ["required", "email"] },
        contact_phone: { type: "Text", title: "Telefonnummer", validators: ["required"] }
      }
    },

    initialize: function(options) {
      this.model = options.model;
      this.collection = options.collection;
    },

    updateUi: function() {
      var step = this.step;
      var length = this.forms.length-1;

      if (step >= length) {
        this.ui.nextButton.hide();
        this.ui.prevButton.show();
        this.ui.submitButton.show();
      }
      else if (step <= 0) {
        this.ui.nextButton.show();
        this.ui.prevButton.hide();
        this.ui.submitButton.hide();
      }
      else {
        this.ui.nextButton.show();
        this.ui.prevButton.show();
        this.ui.submitButton.hide();
      }
    },

    onRender: function() {
      var $el = this.$el;
      var $container = this.ui.formContainer;
      var forms = [];

      _.each(this.schemata, function(schema, index) {
        var form = new Backbone.Form({
          schema: schema
        }).render();

        forms.push(form);
        form.$el.hide();
        $container.append(form.$el);
      });

      _.defer(function(){
        forms[0].$el.show();
        $el.reveal();
      });

      this.forms = forms;
      this.step = 0;
      this.updateUi();
    },

    onNextClick: function() {
      var forms = this.forms;
      var errors = forms[this.step].validate();

      if (errors === null) {
        this.forms[this.step].$el.hide();
        this.forms[++this.step].$el.show();
        this.updateUi();
      }
    },

    onPrevClick: function() {
      this.forms[this.step].$el.hide();
      this.forms[--this.step].$el.show();
      this.updateUi();
    },

    onSubmitClick: function(event) {
      var collection = this.collection;
      var model = this.model;
      var forms = this.forms;
      var errors = forms[this.step].validate();

      if (errors === null) {
        _.each(forms, function(form) {
          var data = form.getValue();
          model.set(data);
        });

        model.save({}, {
          success: function(model){
            collection.add(model);
          }
        });
      }
    },

    close: function(event) {
      this.$el.trigger("reveal:close");
    }

  });
});
