Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {

  Places.EntryView = Marionette.ItemView.extend({

    className: "reveal-modal medium",
    template: "places/entry",

    ui: {
      form: "form"
    },

    events: {
      "submit form": "onSubmit"
    },

    initialize: function(options) {
      this.model = options.model;
      this.collection = options.collection;
    },

    onRender: function() {
      var $el = this.$el;

      this.form = new Backbone.Form({
        model: this.model
      }).render();

      this.ui.form.prepend(this.form.el);

      _.defer(function(){
        $el.reveal();
      });

      console.log("collection", this.collection);

    },

    onSubmit: function(event) {
      event.preventDefault();
      var collection = this.collection;

      this.form.commit();
      this.model.save({}, {
        success: function(model){
          //Do whatever you want e.g.

          console.log("1", collection);
          collection.add(model);
          console.log("2", collection);
        }

      });

    },

    close: function(event) {
      this.$el.trigger("reveal:close");
    }

  });
});
