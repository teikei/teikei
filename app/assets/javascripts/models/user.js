Teikei.module('User', function(User, App, Backbone, Marionette, $, _) {

  User.Model = Backbone.Model.extend({

    urlRoot: "/api/v1/sessions/",

    parse: function(data) {
      this.setAuthToken(data.auth_token);
      this.setUserName(data.user.name);
      return data.user;
    },

    setUserName: function(userName) {
      this.set("userName", userName);
    },

    setAuthToken:function(authToken) {
      this.set("loggedIn", true);
      var headerData = { auth_token: authToken };
      $.ajaxSetup({ headers: headerData });
    },

    signUp: function(signUpData, callback) {
      this.save(signUpData, {
        url: "/api/v1/users",
        success: callback.success,
        error: callback.error
      });
    }

  });
});
