Teikei.module("Places", function(Places, App, Backbone, Marionette, $, _) {


  Places.EntryListItemView = Marionette.ItemView.extend({
    template: "places/list/entryListItem",

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

    ui: {
      newEntryMenuItem: "#new-entry-my-entries",
      newEntryDropdown: "#new-entry-my-entries .dropdown",
    },

    events: {
      "click #new-entry-my-entries": "openNewEntryDropdown",
      "click #add-farm": "addFarm",
      "click #add-depot": "addDepot",
      "click .edit-entry": "editEntry",
      "click .delete-entry": "deleteEntry"
    },

    openNewEntryDropdown: function() {
      var dropdown = this.ui.newEntryDropdown;
      dropdown.show();
      _.defer( function() {
        $("body").one("click", function() {
          dropdown.hide();
        })
      });
    },

    addFarm: function(event) {
      event.preventDefault();
      App.vent.trigger("user:add:farm");
    },

    addDepot: function(event) {
      event.preventDefault();
      App.vent.trigger("user:add:depot");
    },

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
