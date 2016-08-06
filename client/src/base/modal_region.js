Base.ModalRegion = Backbone.Marionette.Region.extend({
  el: '#modal-container',

  onShow(view) {
    view.$el.reveal({
      closeOnBackgroundClick: false,
      closed: this.close
    })
  }
})
