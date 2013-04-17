// Overwriting Backbone.Marionette.Renderer to use JST
Backbone.Marionette.Renderer.render = function(template, data) {
  if (!JST[template]) throw "Template '" + template + "' not found!";
  return JST[template](data);
};


// Extend backbone-forms editors
var editors = Backbone.Form.editors;

editors.YesNoCheckbox = editors.Checkbox.extend({
  getValue: function() {
    return editors.Checkbox.prototype.getValue.call(this) ? "yes" : "no";
  },
  setValue: function(value) {
    editors.Checkbox.prototype.setValue.call(this, value === "yes");
  }
});

editors.Date.monthNames =["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

// Extend backbone-forms validators
var validators = Backbone.Form.validators;

// validators.errMessages.minlength = _.template('Must be at least <%= min %> characters long.', null, Backbone.Form.templateSettings);
// validators.errMessages.integer = 'Must be a number.';

validators.errMessages = {
  required: 'Dieses Feld darf nicht leer sein.',
  regexp: 'Ungültige Eingabe.',
  email: 'Ungültige Email-Adresse.',
  url: 'Ungültige URL',
  integer: 'Ungültige Zahl.',
  match: _.template('Die Passwörter stimmen nicht überein.', null, Backbone.Form.templateSettings)
},

validators.minlength = function(options){
  if (!options.min) throw new Error('Missing required "min" option for "minlength" validator');

  options = _.extend({
    type: 'minlength',
    message: this.errMessages.minlength
  }, options);

  return function minlength(value) {
    options.value = value;

    var err = {
      type: options.type,
      message: _.isFunction(options.message) ? options.message(options) : options.message
    };

    if (value.length < options.min) return err;
  };

};

validators.integer = function(options) {
  options = _.extend({
    type: 'integer',
    message: this.errMessages.integer,
    regexp: /^[0-9]+$/
  }, options);

  return validators.regexp(options);
};


Teikei = new Backbone.Marionette.Application();

Teikei.addRegions({
  userPopup: "#user-popups",
  placesPopup: "#places-popups"
});

Teikei.addInitializer(function(options){
  var userController = new Teikei.User.Controller();
  var userRouter = new Teikei.User.Router({ controller: userController });

  var placesController = new Teikei.Places.Controller();
  var placesRouter = new Teikei.Places.Router({controller: placesController });
  placesController.collection.once("reset", function() {
    Backbone.history.start();
  }, this);
});

$(function(){
  Teikei.start();
});
