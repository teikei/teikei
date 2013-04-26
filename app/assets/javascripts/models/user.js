Teikei.module('User', function(User, App, Backbone, Marionette, $, _) {

  User.Model = Backbone.Model.extend({

    urlRoot: "/api/v1/sessions/",

    initialize: function() {
      if ($.cookie('auth_token')) {
        this.setAuthToken($.cookie('auth_token'));
        this.setUserName($.cookie('username'));
      }
    },

    parse: function(data) {
      $.cookie('username', data.user.name);
      $.cookie('auth_token', data.auth_token);
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
    },

    destroy: function() {
      $.removeCookie('username');
      $.removeCookie('auth_token');
      return Backbone.Model.prototype.destroy.apply(this, arguments);
    }

  });
});
