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
  placesController.collection.once("reset");
});

Teikei.on("initialize:after", function(options){
  if (Backbone.history){
    Backbone.history.start();
  }
});

$(function(){
  Teikei.start();
});
