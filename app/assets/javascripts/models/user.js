Teikei.module('User', function(User, App, Backbone, Marionette, $, _) {

  User.Model = Backbone.Model.extend({

    initialize: function() {
      if (this.tokenIsPresent()) {
        this.setUpHeader();
        this.loadSessionFromCookie();
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
      var userName;
      // Sign up
      if ('name' in data) {
        userName = data.name;
      }
      // Sign in
      if ('user' in data) {
        this.setSessionInCookie(data.user.id, data.user.name, data.auth_token);
        this.setUpHeader();
      }
      return data.user;
    },

    tokenIsPresent: function() {
      return $.cookie("auth_token") !== undefined;
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
      this.unsetSessionInCookie();
      return Backbone.Model.prototype.destroy.apply(this, arguments);
    },

    setSessionInCookie: function(userId, userName, authToken) {
      $.cookie("user_id", userId);
      $.cookie("user_name", userName);
      $.cookie("auth_token", authToken);
    },

    unsetSessionInCookie: function() {
      $.removeCookie("user_id");
      $.removeCookie("user_name");
      $.removeCookie("auth_token");
    },

    loadSessionFromCookie: function() {
      this.set("id", parseInt($.cookie('user_id'), 10));
      this.set("name", $.cookie('user_name'));
    },

    setUpHeader: function() {
      var authToken = $.cookie("auth_token");
      if (authToken === undefined) {
        throw "The cookie is undefined. Invoke `setAuthTokenInCookie` before.";
      }
      var headerData = { auth_token: authToken };
      $.ajaxSetup({ headers: headerData });
    },

    resetHeader: function() {
      // TODO Remove the auth_token onSignOut.
    },

    sync: function(method, model, options){
      return Backbone.Model.prototype.sync.apply(this, arguments);
    }

  });
});
