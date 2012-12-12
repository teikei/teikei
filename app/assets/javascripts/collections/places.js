Teikei.module('Collections', function(Collections, App, Backbone, Marionette, $, _) {
  
  // Local Variables
  // ---------------

  var localStorageKey = 'teikei-backbone-marionettejs';
  
  // Places Collection
  // ---------------

  Collections.Places = Backbone.Collection.extend({
    // localStorage: new Backbone.LocalStorage(localStorageKey)

    model: Teikei.Models.Place

  });

});
