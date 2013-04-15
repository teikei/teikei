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
