Alert = {};

require('./views/flash_message');

Alert.Controller = {
  status: function(message, fadeOut) {
    this._sendFlashMessage({
      message: message,
      fadeOut: this._valueOrDefault(fadeOut, true),
      type: ''
    });
  },

  error: function(message, fadeOut) {
    this._sendFlashMessage({
      message: message,
      fadeOut: this._valueOrDefault(fadeOut, true),
      type: 'alert'
    });
  },

  success: function(message, fadeOut) {
    this._sendFlashMessage({
      message: message,
      fadeOut: this._valueOrDefault(fadeOut, true),
      type: 'success'
    });
  },

  _valueOrDefault: function(value, defaultValue) {
    return (typeof value === "undefined") ? defaultValue : value;
  },

  _sendFlashMessage: function(alertData) {
    var model = new Backbone.Model(alertData);
    this.flashMessageView = new Teikei.Alert.FlashMessageView({model: model});
    Teikei.alertRegion.show(this.flashMessageView);
    if (alertData.fadeOut) {
      // fade out after 10 seconds
      setTimeout(function() {
        Teikei.alertRegion.close();
      }, 10000);
    }
  }
};
