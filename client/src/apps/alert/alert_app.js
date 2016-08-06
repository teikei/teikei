Alert = {}

require('./views/flash_message')

Alert.Controller = {
  status(message, fadeOut) {
    this._sendFlashMessage({
      message,
      fadeOut: this._valueOrDefault(fadeOut, true),
      type: ''
    })
  },

  error(message, fadeOut) {
    this._sendFlashMessage({
      message,
      fadeOut: this._valueOrDefault(fadeOut, true),
      type: 'alert'
    })
  },

  success(message, fadeOut) {
    this._sendFlashMessage({
      message,
      fadeOut: this._valueOrDefault(fadeOut, true),
      type: 'success'
    })
  },

  _valueOrDefault(value, defaultValue) {
    return (typeof value === 'undefined') ? defaultValue : value
  },

  _sendFlashMessage(alertData) {
    const model = new Backbone.Model(alertData)
    this.flashMessageView = new Alert.FlashMessageView({ model })
    Teikei.alertRegion.show(this.flashMessageView)
    if (alertData.fadeOut) {
      // fade out after 10 seconds
      setTimeout(() => {
        Teikei.alertRegion.close()
      }, 10000)
    }
  }
}
