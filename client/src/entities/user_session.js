Teikei.module('Entities', function(Entities, Teikei, Backbone, Marionette, $, _) {

  Entities.UserSession = Backbone.Model.extend({

    defaults: {
      "name": "",
      "phone": "",
      "email": "",
      "password": ""
    },

    methodToURL: {
      'read': '/users',
      'create': '/users/sign_in',
      'update': '/users',
      'delete': '/users/sign_out'
    },

    sync: function(method, model, options) {
      options = options || {};
      options.url = model.methodToURL[method.toLowerCase()];

      return Backbone.sync.apply(this, arguments);
    }

  });
});
