Entities.UserSession = Backbone.Model.extend({

  defaults: {
    'name': '',
    'phone': '',
    'email': '',
    'password': ''
  },

  methodToURL: {
    'read': '/users',
    'create': '/users/sign_in',
    'update': '/users',
    'delete': '/users/sign_out'
  },

  sync(method, model, options = {}) {
    options.url = model.methodToURL[method.toLowerCase()]

    return Backbone.sync.apply(this, arguments)
  }

})

