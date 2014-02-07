var validators = Backbone.Form.validators;

validators.errMessages.minlength = _.template('Must be at least <%= min %> characters long.', null, Backbone.Form.templateSettings);
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

validators.errMessages.selectionrequired = 'At least one item must be selected';
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

validators.url = function(options) {
  options = _.extend({
    type: 'url',
    message: this.errMessages.url,
    regexp: /^((http|https):\/\/)?(([A-Z0-9][A-Z0-9_\-]*)(\.[A-Z0-9][A-Z0-9_\-]*)+)(:(\d+))?\/?/i

  }, options);

  return validators.regexp(options);

};

validators.errMessages.integer = 'Must be a number.';
validators.integer = function(options) {
  options = _.extend({
    type: 'integer',
    message: this.errMessages.integer,
    regexp: /^[0-9]+$/
  }, options);

    return validators.regexp(options);
};

validators.errMessages.phonenumber = 'Phone number is invalid.';
validators.phonenumber = function(options) {
  options = _.extend({
    type: 'phonenumber',
    message: this.errMessages.phonenumber,
    regexp: /^(\+\d)?[\d\s\/-]+$/
  }, options);

    return validators.regexp(options);
};

