Base.AlertRegion = Backbone.Marionette.Region.extend({

  el: '#alert-container',

  open(view) {
    Marionette.Region.prototype.open.apply(this, arguments)
    this.$el.hide()
    this.$el.fadeIn('fast')
  },

  close() {
    this.$el.fadeOut('fast', () => {
      Marionette.Region.prototype.close.apply(this, arguments)
    })
  }

})
