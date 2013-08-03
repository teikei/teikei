Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.DeleteEntryView = Marionette.ItemView.extend({

    className: "reveal-modal",
    template: "places/deleteEntry",

    events: {
      "click .cancel": "cancel",
      "click .delete-entry": "delete"
    },

    initialize: function(model) {
      this.model = model;
    },

    cancel: function() {
      this.$el.trigger('reveal:close');
    },

    delete: function() {
      this.model.destroy({
        success: function(){
          console.log("destroyed it!");
        },
        error: function(){
          console.log("it didn't work..");
        }
      });
      this.$el.trigger('reveal:close');
    },

    onRender: function() {
      var $el = this.$el;
      var view = this;

      _.defer(function(){
        $el.reveal({
          closeOnBackgroundClick: false,
          closed: function(){
            view.close();
          }
        });
      });
    }

  });
});
