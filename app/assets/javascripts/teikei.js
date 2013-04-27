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
