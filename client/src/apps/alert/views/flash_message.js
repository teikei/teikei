Alert.FlashMessageView = Marionette.ItemView.extend({

  template: 'alert/flash_message',

  ui: {},

  events: {},

  initialize(options) {
    this.model = options.model;
  }

});
