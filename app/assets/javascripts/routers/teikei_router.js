Teikei.Router = Backbone.Marionette.AppRouter.extend({
  // "someMethod" must exist at controller.someMethod
  appRoutes: {
    "": "index"
  },

  /* standard routes can be mixed with appRoutes/Controllers above */
  routes : {
    "some/otherRoute" : "someOtherMethod"
  },

});
