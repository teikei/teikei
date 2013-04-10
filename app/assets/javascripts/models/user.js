Teikei.module('User', function(User, App, Backbone, Marionette, $, _) {

  User.Model = Backbone.Model.extend({

    urlRoot: "/api/v1/sessions/",

    parse: function(data) {
      this.setAuthToken(data.auth_token);
      return data.user;
    },

    setAuthToken:function(authToken) {
      this.set("loggedIn", true);
      var headerData = { auth_token: authToken };
      $.ajaxSetup({ headers: headerData });
    }

  });
});
