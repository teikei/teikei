Teikei = new Backbone.Marionette.Application();

Teikei.addInitializer(function(options){
  var controller = new Teikei.Controller();
  new Teikei.Router({controller: controller});
  Backbone.history.start();
});

$(document).ready(function(){
  Teikei.start();
});
