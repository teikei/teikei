// Custom extension to backbone-forms

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



var validators = Backbone.Form.validators;

// validators.errMessages.minlength = _.template('Must be at least <%= min %> characters long.', null, Backbone.Form.templateSettings);
// validators.errMessages.integer = 'Must be a number.';
// validators.errMessages.selectionrequired = 'At least one item must be selected';
// validators.errMessages.phonenumber = 'Phone number is invalid.';

validators.errMessages = {
  required: 'Dieses Feld darf nicht leer sein.',
  regexp: 'Ungültige Eingabe.',
  email: 'Ungültige Email-Adresse.',
  url: 'Ungültige URL.',
  integer: 'Ungültige Zahl.',
  match: _.template('Die Passwörter stimmen nicht überein.', null, Backbone.Form.templateSettings),
  minlength: _.template('Muss mindestens <%= min %> Zeichen lang sein.', null, Backbone.Form.templateSettings),
  selectionrequired: 'Mindestens ein Wert muss ausgewählt sein.',
  phonenumber: 'Ungültige Telefonnummer'
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

validators.selectionrequired = function(options){
  options = _.extend({
      type: 'selectionrequired',
    message: this.errMessages.selectionrequired
  }, options);

  return function selectionrequired(value) {
    options.value = value;

    var err = {
      type: options.type,
      message: _.isFunction(options.message) ? options.message(options) : options.message
    };

    if (value.length === 0) return err;
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

validators.phonenumber = function(options) {
  options = _.extend({
    type: 'phonenumber',
    message: this.errMessages.phonenumber,
    regexp: /^(\+\d)?[\d\s\/-]+$/
  }, options);

  return validators.regexp(options);
};

