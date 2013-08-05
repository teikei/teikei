Teikei.module('User', function(User, App, Backbone, Marionette, $, _) {

  User.Model = Backbone.Model.extend({

    // urlRoot: "/api/v1/sessions/",

    // defaults: {
    //   auth_token: ""
    // },

    initialize: function() {
      if (this.tokenIsPresent()) {
        this.setUpHeader();
        this.setAuthToken($.cookie('auth_token'));
        this.set("name", $.cookie('username'));
      }
    },

    signIn: function(signInData, callback) {
      return this.save(signInData, {
        url: "/users/sign_in",
        success: callback.success,
        error: callback.error
      });
    },

    parse: function(data) {
      userName = undefined;
      // Sign up
      if ('name' in data) {
        userName = data.name;
      }
      // Sign in
      else if ('user' in data) {
        this.setAuthTokenInCookie(data.auth_token);
        this.setUpHeader();
        userName = data.user.name;
      }
      this.setUserNameInCookie(userName);
      return data.user;
    },

    tokenIsPresent: function() {
      return $.cookie("auth_token") !== undefined;
    },

    setAuthToken:function(authToken) {
      this.set("loggedIn", true);
    },

    signUp: function(signUpData, callback) {
      return this.save(signUpData, {
        url: "/api/v1/users",
        success: callback.success,
        error: callback.error
      });
    },

    signOut: function(callback) {
      return this.destroy({
        url: "/users/sign_out",
        success: callback.success,
        error: callback.error
      });
    },

    destroy: function() {
      this.unsetUserNameInCookie();
      this.unsetAuthTokenInCookie();
      return Backbone.Model.prototype.destroy.apply(this, arguments);
    },

    setAuthTokenInCookie: function(authToken) {
      $.cookie("auth_token", authToken);
    },

    unsetAuthTokenInCookie: function() {
      $.removeCookie("auth_token");
    },

    setUpHeader: function() {
      authToken = $.cookie("auth_token");
      if (authToken === undefined) {
        throw "The cookie is undefined. Invoke `setAuthTokenInCookie` before.";
      }
      var headerData = { auth_token: authToken };
      $.ajaxSetup({ headers: headerData });
    },

    resetHeader: function() {
      // TODO Remove the auth_token onSignOut.
    },

    setUserNameInCookie: function(userName) {
      $.cookie("username", userName);
    },

    unsetUserNameInCookie: function() {
      $.removeCookie("username");
    },

    sync: function(method, model, options){
      console.log("User.sync.method", method);
      return Backbone.Model.prototype.sync.apply(this, arguments);
    }


  });
});
