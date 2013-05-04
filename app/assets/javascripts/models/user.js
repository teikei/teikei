Teikei.module('User', function(User, App, Backbone, Marionette, $, _) {

  User.Model = Backbone.Model.extend({

    urlRoot: "/api/v1/sessions/",

    defaults: {
      id: 0,
      user_name: "",
      auth_token: ""
    },

    initialize: function() {
      if ($.cookie('auth_token')) {
        this.setAuthToken($.cookie('auth_token'));
        this.setUserName($.cookie('username'));
      }
    },

    parse: function(data) {
      $.cookie('auth_token', data.auth_token);
      this.setAuthToken(data.auth_token);
      userName = undefined;
      // Sign up
      if ('name' in data) {
        userName = data.name;
      }
      // Sign in
      else if ('user' in data) {
        userName = data.user.name;
      }
      $.cookie('username', userName);
      this.setUserName(userName);
      return data;
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
    },

    sync: function(method, model, options){
      if (method === "delete"){
        options.url = "/users/sign_out";
      } else {
        method = "create";
        options.url = "/users/sign_in";
      }
      Backbone.Model.prototype.sync.apply(this, arguments);
    }


  });
});
