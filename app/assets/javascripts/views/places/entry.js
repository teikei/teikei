Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.EntryView = Marionette.ItemView.extend({

    className: "reveal-modal large",
    template: "places/entry",

    ui: {
      headline: ".headline",
      formContainer: ".forms",
      nextButton: ".next",
      prevButton: ".prev",
      submitButton: ".submit",
      cityInput: ".city input",
      addressInput: ".address input",
      previewImage: ".preview-image",
      previewMap: ".preview-map",
      previewMarker: ".preview-marker",
      previewButton: ".preview-button"
    },

    events: {
      "click .next": "onNextClick",
      "click .prev": "onPrevClick",
      "click .submit": "onSubmitClick",
      "click .preview-button": "updateMapPreview",
      "blur .city": "updateMapPreview",
      "blur .address": "updateMapPreview"
    },

    isRevealed: false,

    // Override this with a schema for the actual form:
    schemata: {},

    initialize: function(options) {
      this.model = options.model;
      this.collection = options.collection;
      this.headline = options.headline;
    },

    updateUi: function() {
      this.bindUIElements();
      this.ui.headline.text(this.headline);
      this.updateMapPreview();

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
      var view = this;
      var schemata = this.schemata();
      var forms = [];

      _.each(schemata, function(schema, formId) {
        var templateFile = Marionette.Renderer.render("places/forms/" + formId);
        var form = new Backbone.Form({
          model: this.model,
          schema: schema,
          template: _.template(templateFile)
        }).render();

        forms.push(form);
        form.$el.hide();
        $container.append(form.$el);
      }, this);

      _.defer(function(){
        forms[0].$el.show();
        view.isRevealed = true;
        $el.reveal({
          closeOnBackgroundClick: false,
          close: function(){
            view.trigger("modal:close");
            view.isRevealed = false;
          }
        });
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
      var $el = this.$el;

      if (errors === null) {
        _.each(forms, function(form) {
          var data = form.getValue();
          model.set(data);
        });

        model.save({}, {
          success: function(model){
            collection.add(model);
            $el.trigger('reveal:close');
          }
        });
      }
    },

    updateMapPreview: function() {
      var city = this.ui.cityInput.val();
      var address = this.ui.addressInput.val();
      var previewMap = this.ui.previewMap;
      var img = this.ui.previewImage;
      var previewMarker = this.ui.previewMarker;
      var placeholderSource = "/assets/preview-placeholder.png";
      var entry = this;

      if (city === "" || address === "") {
        return;
      }

      previewMarker.hide();
      previewMap.spin();
      img.attr("src", placeholderSource);

      this.model.geocode(city, address, function(data) {
        var source = placeholderSource;
        var lat = data.get("latitude");
        var lng = data.get("longitude");
        if (lat && lng) {
          source = "http://api.tiles.mapbox.com/v3/{APIKEY}/{LNG},{LAT},13/300x200.png"
          .replace("{APIKEY}", Places.MapConfig.APIKEY)
          .replace("{LAT}", lat)
          .replace("{LNG}", lng);
          // only show marker if location is valid
          img.one('load', function() {
            previewMarker.show();
          });
        }
        img.attr("src", source);
        img.one('load', function() {
          previewMap.spin(false);
        });
      });
    }
  });
});
