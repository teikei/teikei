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

  Places.EntryListEmptyView = Marionette.ItemView.extend({
    template: "places/list/entryListEmptyView"
  });

  Places.EntryListView = Marionette.CompositeView.extend({

    className: "reveal-modal large",
    template: "places/list/entryList",

    itemView: Places.EntryListItemView,
    itemViewContainer: "#entrylist",
    emptyView: Places.EntryListEmptyView,

    initialize: function(options) {
      this.collection = options.collection;
    }
  });

});
