Teikei.module('User', function(User, App, Backbone, Marionette, $, _) {

  User.Model = Backbone.Model.extend({

    url: "/api/v1/sessions.json",

    parse: function(data) {
      return data.user
    }

  });
});
