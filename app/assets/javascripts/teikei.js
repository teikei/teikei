// Overwriting Backbone.Marionette.Renderer to use JST
Backbone.Marionette.Renderer.render = function(template, data) {
  if (!JST[template]) throw "Template '" + template + "' not found!";
  return JST[template](data);
};


// Extend and configure backbone-forms editors
var editors = Backbone.Form.editors;

editors.YesNoCheckbox = editors.Checkbox.extend({
  getValue: function() {
    return editors.Checkbox.prototype.getValue.call(this) ? "yes" : "no";
  },
  setValue: function(value) {
    editors.Checkbox.prototype.setValue.call(this, value === "yes");
  }
});

// Extend and translate backbone-forms validators
var validators = Backbone.Form.validators;

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
      message: 'must be at least ' + options.min + ' characters long'
    };

    if (value.length < options.min) return err;
  };

};


editors.Date.monthNames =["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];


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
