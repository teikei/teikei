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
  vegetable_products: [
    { label: "Gemüse", val: "vegetables"},
    { label: "Obst", val: "fruits"},
    { label: "Pilze", val: "mushrooms"},
    { label: "Getreideprodukte", val: "cereals"},
    { label: "Brot und Backwaren", val: "bread_and_pastries"},
    { label: "Gewürze", val: "spices"}
  ],
  vegetable_products_long: [
    { label: "Gemüse", val: "vegetables"},
    { label: "Obst", val: "fruits"},
    { label: "Pilze", val: "mushrooms"},
    { label: "Getreideprodukte (z.B. Mehl, Grieß, Nudeln)", val: "cereals"},
    { label: "Brot und Backwaren", val: "bread_and_pastries"},
    { label: "Gewürze", val: "spices"}
  ],
  animal_products: [
    { label: "Eier", val: "eggs"},
    { label: "Fleisch", val: "meat"},
    { label: "Wurstwaren", val: "sausages"},
    { label: "Milch", val: "milk"},
    { label: "Milchprodukte", val: "dairy"},
    { label: "Fisch", val: "fish"},
    { label: "Honig", val: "honey"}
  ],
  animal_products_long: [
    { label: "Eier", val: "eggs"},
    { label: "Fleisch", val: "meat"},
    { label: "Wurstwaren", val: "sausages"},
    { label: "Milch", val: "milk"},
    { label: "Milchprodukte (z.B. Butter, Käse, Joghurt)", val: "dairy"},
    { label: "Fisch", val: "fish"},
    { label: "Honig", val: "honey"}
  ],
  beverages: [
    { label: "Saft", val: "juice"},
    { label: "Wein", val: "wine"},
    { label: "Bier", val: "beer"}
  ]
};

Teikei.addInitializer(function(options){

  Teikei.addRegions({
    modalRegion: Teikei.Base.ModalRegion,
    alertRegion: Teikei.Base.AlertRegion,
    controlsRegion: "#controls-container"
  });

  var userController = new Teikei.User.Controller();
  Teikei.currentUser = userController.model;
  var userRouter = new Teikei.User.Router({ controller: userController });

  var participateController = new Teikei.Participate.Controller();
  var participateRouter = new Teikei.Participate.Router({ controller: participateController });

  var placesController = new Teikei.Places.Controller();
  var placesRouter = new Teikei.Places.Router({controller: placesController });

  var placesListController = new Teikei.PlacesList.Controller();
  var placesListRouter = new Teikei.PlacesList.Router({controller: placesListController });

});

Teikei.on("initialize:after", function(options){
  if (Backbone.history){
    Backbone.history.start();
  }
});

$(function(){
  Teikei.start();
});
