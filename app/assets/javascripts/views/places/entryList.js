Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {


  Places.EntryListItemView = Marionette.ItemView.extend({
    template: "places/list/entryListItem",

    events: {
      "click .edit-entry": "editEntry",
      "click .delete-entry": "deleteEntry"
    },

    editEntry: function(){
      App.vent.trigger("edit:entry", this.model);
    },

    deleteEntry: function(){
      App.vent.trigger("delete:entry", this.model);
    }
  });

  Places.EntryListView = Marionette.CompositeView.extend({

    className: "reveal-modal large",
    template: "places/list/entryList",

    itemView: Places.EntryListItemView,
    itemViewContainer: "#entrylist",

    initialize: function(options) {
      this.collection = options.collection;
    },

    onRender: function() {

      var $el = this.$el;
      var view = this;

      _.defer(function(){
        $el.reveal({
          closeOnBackgroundClick: false,
          closed: function(){
            view.trigger("reveal:closed");
          }
        });
      });
    }
  });

});
