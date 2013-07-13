// backbone-form i18n

Backbone.Form.editors.Date.monthNames =["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

Backbone.Form.validators.errMessages = {
  required: 'Dieses Feld darf nicht leer sein.',
  regexp: 'Ungültige Eingabe.',
  email: 'Ungültige Email-Adresse.',
  url: 'Ungültige URL.',
  integer: 'Ungültige Zahl.',
  match: _.template('Die Passwörter stimmen nicht überein.', null, Backbone.Form.templateSettings),
  minlength: _.template('Muss mindestens <%= min %> Zeichen lang sein.', null, Backbone.Form.templateSettings),
  selectionrequired: 'Mindestens ein Wert muss ausgewählt sein.',
  phonenumber: 'Ungültige Telefonnummer'
};

// Overwriting Backbone.Marionette.Renderer to use JST
Backbone.Marionette.Renderer.render = function(template, data) {
  if (!JST[template]) throw "Template '" + template + "' not found!";
  return JST[template](data);
};

/**
 * SELECT2
 *
 * Renders Select2 - jQuery based replacement for select boxes
 *
 * Requires an 'options.values' value on the schema.
 *  Can be an array of options, a function that calls back with the array of options, a string of HTML
 *  or a Backbone collection. If a collection, the models must implement a toString() method
 *
 * Source: https://gist.github.com/Integral/5156170
 */
Backbone.Form.editors.Select2 = Backbone.Form.editors.Base.extend({

  tagName: 'select',

  events: {
    'change': function(event) {
      this.trigger('change', this);
    },
    'focus': function(event) {
      this.trigger('focus', this);
    },
    'blur': function(event) {
      this.trigger('blur', this);
    }
  },

  initialize: function(options) {
    Backbone.Form.editors.Base.prototype.initialize.call(this, options);

    if (!this.schema || !this.schema.options.values) throw "Missing required 'schema.options.values'";
  },

  render: function() {
    var self = this;
    this.setOptions(this.schema.options.values);
    if (this.schema.options.multiple) {
      this.$el.attr('multiple', 'multiple');
    }
    setTimeout(function() {
      self.$el.select2({
        width: 'resolve'
      });
    }, 0);

    return this;
  },

  /**
   * Sets the options that populate the <select>
   *
   * @param {Mixed} options
   */
  setOptions: function(options) {
    var self = this;

    //If a collection was passed, check if it needs fetching
    if (options instanceof Backbone.Collection) {
      var collection = options;

      //Don't do the fetch if it's already populated
      if (collection.length > 0) {
        this.renderOptions(options);
      } else {
        collection.fetch({
          success: function(collection) {
            self.renderOptions(options);
          }
        });
      }
    }

    //If a function was passed, run it to get the options
    else if (_.isFunction(options)) {
      options(function(result) {
        self.renderOptions(result);
      }, self);
    }

    //Otherwise, ready to go straight to renderOptions
    else {
      this.renderOptions(options);
    }
  },

  /**
   * Adds the <option> html to the DOM
   * @param {Mixed}   Options as a simple array e.g. ['option1', 'option2']
   *                      or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
   *                      or as a string of <option> HTML to insert into the <select>
   */
  renderOptions: function(options) {
    var $select = this.$el,
      html;

    html = this._getOptionsHtml(options);

    //Insert options
    $select.html(html);

    //Select correct option
    this.setValue(this.value);
  },

  _getOptionsHtml: function(options) {
    var html;
    //Accept string of HTML
    if (_.isString(options)) {
      html = options;
    }

    //Or array
    else if (_.isArray(options)) {
      html = this._arrayToHtml(options);
    }

    //Or Backbone collection
    else if (options instanceof Backbone.Collection) {
      html = this._collectionToHtml(options);
    } else if (_.isFunction(options)) {
      var newOptions;

      options(function(opts) {
        newOptions = opts;
      }, this);

      html = this._getOptionsHtml(newOptions);
    }

    return html;
  },

  getValue: function() {
    return this.$el.val();
  },

  setValue: function(value) {
    this.$el.val(value);
  },

  focus: function() {
    if (this.hasFocus) return;

    this.$el.focus();
  },

  blur: function() {
    if (!this.hasFocus) return;

    this.$el.blur();
  },

  /**
   * Transforms a collection into HTML ready to use in the renderOptions method
   * @param {Backbone.Collection}
   * @return {String}
   */
  _collectionToHtml: function(collection) {
    //Convert collection to array first
    var array = [];
    collection.each(function(model) {
      array.push({
        val: model.id,
        label: model.toString()
      });
    });

    //Now convert to HTML
    var html = this._arrayToHtml(array);

    return html;
  },

  /**
   * Create the <option> HTML
   * @param {Array}   Options as a simple array e.g. ['option1', 'option2']
   *                      or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
   * @return {String} HTML
   */
  _arrayToHtml: function(array) {
    var html = [];

    //Generate HTML
    _.each(array, function(option) {
      if (_.isObject(option)) {
        if (option.group) {
          html.push('<optgroup label="' + option.group + '">');
          html.push(this._getOptionsHtml(option.options));
          html.push('</optgroup>');
        } else {
          var val = (option.val || option.val === 0) ? option.val : '';
          html.push('<option value="' + val + '">' + option.label + '</option>');
        }
      } else {
        html.push('<option>' + option + '</option>');
      }
    }, this);

    return html.join('');
  }

});

Teikei = new Backbone.Marionette.Application();

Teikei.labels = {
  products: [
    { label: "Gemüse", val: "vegetables"},
    { label: "Früchte", val: "fruit"},
    { label: "Milchprodukte", val: "dairy"},
    { label: "Milch", val: "milk"},
    { label: "Brot", val: "bread"},
    { label: "Fleisch", val: "meat"},
    { label: "Eier", val: "eggs"},
    { label: "Kräuter", val: "herbs"},
    { label: "Anderes", val: "other"}
  ],
  farming_standards: [
    { label: "Biologisch", val: "organic"},
    { label: "Bio-Dynamisch", val: "biodynamic"},
    { label: "Integriert", val: "integrated"}
  ]
};

Teikei.addRegions({
  userPopup: "#user-popups",
  participatePopup: "#participate-popups",
  placesPopup: "#places-popups",
  placesEntryPopup: "#places-entry-popups"
});

Teikei.addInitializer(function(options){
  var userController = new Teikei.User.Controller();
  var userRouter = new Teikei.User.Router({ controller: userController });

  var participateController = new Teikei.Participate.Controller();
  var participateRouter = new Teikei.Participate.Router({ controller: participateController });

  var placesController = new Teikei.Places.Controller();
  var placesRouter = new Teikei.Places.Router({controller: placesController });
  placesController.collection.once("reset", function() {
    Backbone.history.start();
  }, this);
});

$(function(){
  Teikei.start();
});
